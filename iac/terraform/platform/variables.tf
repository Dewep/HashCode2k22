variable "project_name" {
  type    = string
  default = "hashcode-2k-template"
}

variable "scw_access_key" {
  type      = string
  sensitive = true
}

variable "scw_private_key" {
  type      = string
  sensitive = true
}

variable "scw_project_id" {
  type = string
}

locals {
  scw_region = "nl-ams"
  scw_zone   = "nl-ams-1"
  registry_username = "hashcode"
}
