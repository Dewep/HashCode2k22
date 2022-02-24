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
    scaleway = {
      source  = "scaleway/scaleway"
      version = "2.2.1-rc.1"
    }
    local = {
      source  = "hashicorp/local"
      version = "2.1.0"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.8.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.4.1"
    }
    random = {
      source = "hashicorp/random"
      version = "3.1.0"
    }
    htpasswd = {
      source = "loafoe/htpasswd"
      version = "1.0.1"
    }
    time = {
      source = "hashicorp/time"
      version = "0.7.2"
    }
  }
}

provider "random" {}

provider "htpasswd" {}

provider "time" {}

provider "scaleway" {
  access_key = var.scw_access_key
  secret_key = var.scw_private_key
  project_id = var.scw_project_id
  zone       = local.scw_zone
  region     = local.scw_region
}
