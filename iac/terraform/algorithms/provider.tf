terraform {
  required_version = "~> 1"

  backend "s3" {
    endpoint                    = "https://s3.nl-ams.scw.cloud"
    bucket                      = "hashcode-tf-state"
    key                         = "state-kubeconfig"
    region                      = "nl-ams"
    skip_credentials_validation = true
    skip_region_validation      = true
  }

  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "2.4.1"
    }
  }
}

provider "helm" {
  kubernetes {
    config_path = "../config_hashcode"
  }
}
