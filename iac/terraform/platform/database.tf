resource "scaleway_rdb_instance" "hashcode" {
  name           = "hashcode"
  node_type      = "DB-DEV-XL"
  engine         = "PostgreSQL-13"
  is_ha_cluster  = false
  disable_backup = false
  volume_type    = "bssd"
}

resource "scaleway_rdb_database" "hashcode" {
  instance_id    = scaleway_rdb_instance.hashcode.id
  name           = "hashcode"
}
