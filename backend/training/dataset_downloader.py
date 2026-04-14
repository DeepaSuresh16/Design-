import os
import subprocess

def setup_kaggle_api():
    """
    Ensure Kaggle API token exists in ~/.kaggle/kaggle.json
    You must get this from your Kaggle Account Settings -> Create New API Token
    """
    kaggle_dir = os.path.expanduser("~/.kaggle")
    if not os.path.exists(os.path.join(kaggle_dir, "kaggle.json")):
        print("Error: Kaggle API token not found at ~/.kaggle/kaggle.json")
        print("Please upload your kaggle.json file to continue.")
        return False
    return True

def download_datasets():
    if not setup_kaggle_api(): return

    datasets = [
        "tanishqraina/plantvillage",
        "jayaprakashpondy/soil-image-dataset",
        "atharvaingle/crop-recommendation-dataset"
    ]

    os.makedirs("datasets", exist_ok=True)
    
    for dataset in datasets:
        print(f"Downloading {dataset}...")
        try:
            # Requires kaggle CLI installed
            subprocess.run(["kaggle", "datasets", "download", "-d", dataset, "-p", "datasets", "--unzip"], check=True)
            print(f"Successfully downloaded and extracted {dataset}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to download {dataset}: {e}")

if __name__ == "__main__":
    download_datasets()
