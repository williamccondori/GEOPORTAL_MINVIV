import warnings
from collections import OrderedDict
from urllib.parse import urlencode

import urllib3
from owslib.etree import etree
from owslib.fgdc import Metadata
from owslib.iso import MD_Metadata
from owslib.map.common import WMSCapabilitiesReader
from owslib.map.wms111 import OperationMetadata, ContentMetadata, n, ServiceIdentification
from owslib.ows import ServiceProvider
from owslib.util import Authentication, openURL, strip_bom, ServiceException, bind_url, clean_ows_url, nspath_eval

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  # noqa


class WebMapServiceCapabilitiesReader(WMSCapabilitiesReader):
    def __init__(self, version='1.1.1', url=None, un=None, pw=None, headers=None, auth=None):
        super().__init__(version, url, un, pw, headers, auth)

    def read(self, service_url, timeout=30):
        self.request = self.capabilities_url(service_url)
        split_url = self.request.split('?')
        u = openURL(split_url[0], split_url[1], method='Get',
                    timeout=timeout, headers=self.headers, auth=self.auth, verify=False)
        raw_text = strip_bom(u.read())
        return etree.fromstring(raw_text)


class WebMapServiceContentMetadata(ContentMetadata):
    def __init__(self, elem, parent=None, children=None, index=0, parse_remote_metadata=False, timeout=30, auth=None):
        super().__init__(elem, parent, children, index, parse_remote_metadata, timeout, auth)

    def parse_remote_metadata(self, timeout=30):
        for metadataUrl in self.metadataUrls:
            if metadataUrl['url'] is not None \
                    and metadataUrl['format'].lower() in ['application/xml', 'text/xml']:  # download URL
                try:
                    content = openURL(
                        metadataUrl['url'], timeout=timeout, auth=self.auth, verify=False)
                    doc = etree.fromstring(content.read())

                    if metadataUrl['type'] == 'FGDC':  # noqa
                        info_metadata = doc.find('.//metadata')
                        if info_metadata is not None:
                            metadataUrl['metadata'] = Metadata(info_metadata)
                            continue

                    if metadataUrl['type'] == 'TC211':
                        info_metadata = doc.find('.//' + nspath_eval('gmd:MD_Metadata', n.get_namespaces(['gmd']))) \
                                        or doc.find('.//' + nspath_eval('gmi:MI_Metadata', n.get_namespaces(['gmi'])))
                        if info_metadata is not None:
                            metadataUrl['metadata'] = MD_Metadata(info_metadata)
                            continue
                except Exception as e:
                    warnings.warn("Could not parse remote metadata: %s" % e)
                    metadataUrl['metadata'] = None


class WebMapService111(object):
    def __getitem__(self, name):
        if name in self.__getattribute__('contents'):
            return self.__getattribute__('contents')[name]
        else:
            raise KeyError("No content named %s" % name)

    def __init__(self, url, version='1.1.1', xml=None, username=None, password=None,
                 parse_remote_metadata=False, headers=None, timeout=30, auth=None):
        if auth:
            if username:
                auth.username = username
            if password:
                auth.password = password
        self.url = url
        self.version = version
        self.timeout = timeout
        self.headers = headers
        self._capabilities = None
        self.auth = auth or Authentication(username, password)
        reader = WebMapServiceCapabilitiesReader(
            self.version, url=self.url, headers=headers, auth=self.auth)
        if xml:
            self._capabilities = reader.readString(xml)
        else:
            self._capabilities = reader.read(self.url, timeout=self.timeout)
        self.request = reader.request
        se = self._capabilities.find('ServiceException')
        if se is not None:
            err_message = str(se.text).strip()
            raise ServiceException(err_message)
        self._build_metadata(parse_remote_metadata)

    def _build_metadata(self, parse_remote_metadata=False):
        self.updateSequence = self._capabilities.attrib.get('updateSequence')
        service_lem = self._capabilities.find('Service')
        self.identification = ServiceIdentification(service_lem, self.version)

        self.provider = ServiceProvider(service_lem)
        self.operations = []
        for elem in self._capabilities.find('Capability/Request')[:]:
            self.operations.append(OperationMetadata(elem))
        self.contents = OrderedDict()
        caps = self._capabilities.find('Capability')

        def gather_layers(parent_elem, parent_metadata):
            layers = []
            for index, item in enumerate(parent_elem.findall('Layer')):
                cm = WebMapServiceContentMetadata(item, parent=parent_metadata, index=index + 1,
                                                  parse_remote_metadata=parse_remote_metadata)
                if cm.id:
                    if cm.id in self.contents:
                        warnings.warn('Content metadata for layer "%s" already exists. Using child layer' % cm.id)
                    layers.append(cm)
                    self.contents[cm.id] = cm
                cm.children = gather_layers(item, cm)
            return layers

        gather_layers(caps, None)
        self.exceptions = [f.text for f in self._capabilities.findall('Capability/Exception/Format')]

    def items(self):
        items = []
        for item in self.contents:
            items.append((item, self.contents[item]))
        return items

    def get_capabilities(self):
        reader = WebMapServiceCapabilitiesReader(
            self.version, url=self.url, auth=self.auth)
        url = reader.capabilities_url(self.url)
        u = openURL(url, timeout=self.timeout, headers=self.headers, auth=self.auth, verify=False)
        if u.info()['Content-Type'] == 'application/vnd.ogc.se_xml':
            se_xml = u.read()
            se_tree = etree.fromstring(se_xml)
            err_message = str(se_tree.find('ServiceException').text).strip()
            raise ServiceException(err_message)
        return u

    def __build_get_map_request(self, layers=None, styles=None, srs=None, bbox=None, format_output=None, size=None,
                                time=None, transparent=False, bgcolor=None, exceptions=None, **kwargs):  # noqa
        request = {'service': 'WMS', 'version': self.version, 'request': 'GetMap'}
        assert len(layers) > 0
        request['layers'] = ','.join(layers)
        if styles:
            assert len(styles) == len(layers)
            request['styles'] = ','.join(styles)
        else:
            request['styles'] = ''
        request['width'] = str(size[0])
        request['height'] = str(size[1])
        request['srs'] = str(srs)
        request['bbox'] = ','.join([repr(x) for x in bbox])
        request['format'] = str(format_output)
        request['transparent'] = str(transparent).upper()
        request['bgcolor'] = '0x' + bgcolor[1:7]  # noqa
        request['exceptions'] = str(exceptions)
        if time is not None:
            request['time'] = str(time)
        if kwargs:
            for kw in kwargs:
                request[kw] = kwargs[kw]
        return request

    def get_map(self, layers=None, styles=None, srs=None, bbox=None, format_output=None, size=None, time=None,
                transparent=False, bgcolor='#FFFFFF', exceptions='application/vnd.ogc.se_xml', method='Get',  # noqa
                timeout=None, **kwargs):
        try:
            base_url = next((m.get('url') for m in self.get_operation_by_name('GetMap').methods if
                             m.get('type').lower() == method.lower()))
        except StopIteration:
            base_url = self.url
        request = self.__build_get_map_request(
            layers=layers,
            styles=styles,
            srs=srs,
            bbox=bbox,
            format=format_output,
            size=size,
            time=time,
            transparent=transparent,
            bgcolor=bgcolor,
            exceptions=exceptions,
            **kwargs)
        data = urlencode(request)
        self.request = bind_url(base_url) + data
        u = openURL(base_url, data, method, timeout=timeout or self.timeout, auth=self.auth, headers=self.headers,
                    verify=False)
        if u.info().get('Content-Type', '').split(';')[0] in ['application/vnd.ogc.se_xml']:
            se_xml = u.read()
            se_tree = etree.fromstring(se_xml)
            err_message = str(se_tree.find('ServiceException').text).strip()
            raise ServiceException(err_message)
        return u

    def get_feature_info(self, layers=None, styles=None, srs=None, bbox=None, output_format=None, size=None, time=None,
                         transparent=False, bgcolor='#FFFFFF', exceptions='application/vnd.ogc.se_xml',  # noqa
                         query_layers=None, xy=None, info_format=None, feature_count=20, method='Get',
                         timeout=None, cql_filter=None,
                         **kwargs):
        try:
            base_url = next((m.get('url') for m in self.get_operation_by_name('GetFeatureInfo').methods
                             if m.get('type').lower() == method.lower()))
        except StopIteration:
            base_url = self.url
        request = self.__build_get_map_request(
            layers=layers,
            styles=styles,
            srs=srs,
            bbox=bbox,
            format=output_format,
            size=size,
            time=time,
            transparent=transparent,
            bgcolor=bgcolor,
            exceptions=exceptions,
            **kwargs)
        request['request'] = 'GetFeatureInfo'
        if not query_layers:
            __str_query_layers = ','.join(layers)
        else:
            __str_query_layers = ','.join(query_layers)
        request['query_layers'] = __str_query_layers
        request['x'] = str(xy[0])
        request['y'] = str(xy[1])
        request['info_format'] = info_format
        request['feature_count'] = str(feature_count)
        if cql_filter:
            request['CQL_FILTER'] = str(cql_filter)
        data = urlencode(request)
        self.request = bind_url(base_url) + data
        u = openURL(base_url, data, method, timeout=timeout or self.timeout, auth=self.auth, headers=self.headers,
                    verify=False)
        if u.info()['Content-Type'] == 'application/vnd.ogc.se_xml':
            se_xml = u.read()
            se_tree = etree.fromstring(se_xml)
            err_message = str(se_tree.find('ServiceException').text).strip()
            raise ServiceException(err_message)
        return u

    def get_service_xml(self) -> str | None:
        xml = None
        if self._capabilities is not None:
            xml = etree.tostring(self._capabilities)
        return xml

    def get_operation_by_name(self, name) -> OperationMetadata:
        for item in self.operations:
            if item.name == name:
                return item
        raise KeyError("No operation named %s" % name)


def web_map_service(url, version='1.1.1', xml=None, username=None, password=None, parse_remote_metadata=False,
                    timeout=30, headers=None, auth=None):
    if auth:
        if username:
            auth.username = username
        if password:
            auth.password = password
    else:
        auth = Authentication(username, password)

    clean_url = clean_ows_url(str(url))
    if version in ['1.1.1']:
        return WebMapService111(
            clean_url, version=version, xml=xml, parse_remote_metadata=parse_remote_metadata,
            timeout=timeout, headers=headers, auth=auth)
    raise NotImplementedError(
        'The WMS version ({}) you requested is not implemented. Please use 1.1.1 or 1.3.0.'.format(version))
