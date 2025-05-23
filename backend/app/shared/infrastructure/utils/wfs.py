from owslib.wfs import WebFeatureService


def get_wfs_formats(wfs_url: str) -> list[str]:
    try:
        wfs = WebFeatureService(wfs_url, version='1.1.0')
        get_feature_op = wfs.getOperationByName('GetFeature')
        return list(get_feature_op.formatOptions)
    except Exception as e:
        print(f"Error retrieving WFS formats: {e}")
        return []
