import zlib
from pathlib import Path

import requests
from google.cloud import storage

# OUTPUTS
DOWNLOAD_PATH = "inputs"
ARXIV_FILENAME = "arxiv-metadata-oai-snapshot.json"

# INPUT FILES
PWC_PAPERS_URL = "https://paperswithcode.com/media/about/papers-with-abstracts.json.gz"
PWC_LINKS_URL = "https://paperswithcode.com/media/about/links-between-papers-and-code.json.gz"
ARXIV_JSON = "gs://arxiv-dataset/metadata-v5/arxiv-metadata-oai.json"



CHUNK_SIZE = 8192


def download_file(origin: str, dest_path: str, chunk_size: int):
    """
    Downloads a json file with .gz extension from origin URL, decompresses it and stores to the specified destination directory.

    Args:
    origin: (str) URL of the input file
    dest_path: (str) destination directory path at which to save the output (without the filename)
    """
    local_filename = origin.split('/')[-1].rstrip(".gz")
    local_path = Path(dest_path, local_filename)
    print(f"Downloading {local_filename} to {dest_path}")

    with requests.get(origin, stream=True) as r:
        r.raise_for_status()
        r.raw.decode_content = True
        with open(local_path, 'wb') as f:
            # 32 is the header for gzip
            d = zlib.decompressobj(zlib.MAX_WBITS | 32)
            for chunk in r.iter_content(chunk_size=chunk_size):
                b = d.decompress(chunk)
                f.write(b)

    return local_path


def download_arxiv_json(origin: str, dest_path: str, file_name: str):
    """
    Downloads the latest snapshot from arxiv metadata google storage

    Args:
    origin: (str) URL of the input file
    dest_path: (str) destination directory path at which to save the output (without the filename)
    """
    print(f"Downloading arxiv json to: {dest_path}/{file_name}")
    client = storage.Client.create_anonymous_client()
    dest = Path(dest_path, file_name)
    with open(dest, "wb") as f:
        client.download_blob_to_file(origin, f)


if __name__ == "__main__":
    print("Downloading input files")
    download_arxiv_json(ARXIV_JSON, DOWNLOAD_PATH, ARXIV_FILENAME)
    download_file(PWC_PAPERS_URL, DOWNLOAD_PATH, CHUNK_SIZE)
    download_file(PWC_LINKS_URL, DOWNLOAD_PATH, CHUNK_SIZE)
    print("Files successfully downloaded")
