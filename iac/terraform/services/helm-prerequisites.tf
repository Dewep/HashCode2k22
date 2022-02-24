resource "kubernetes_namespace" "cluster_issuer" {
  depends_on = [
  ]
  metadata {
    name = "cluster-issuer"
  }
}

resource "time_sleep" "wait_for_cluster_issuer_namespace" {
  depends_on = [
    kubernetes_namespace.cluster_issuer,
  ]

  create_duration = "20s"
}

resource "helm_release" "cert_manager" {
  depends_on = [
  ]

  name      = "cert-manager"
  chart     = "../../k8s/charts/cert-manager"
}

resource "helm_release" "cluster_issuer" {
  depends_on = [
    time_sleep.wait_for_cluster_issuer_namespace,
    helm_release.cert_manager
  ]
  name      = "cluster-issuer"
  namespace = "cluster-issuer"
  chart     = "../../k8s/charts/cluster-issuer"
}

resource "random_password" "registry_password" {
  length = 30
}

resource "local_file" "registry_password" {
  content     = "${random_password.registry_password.result}"
  filename    = "registry_password"
}

resource "htpasswd_password" "registry_password" {
  password = random_password.registry_password.result
}

resource "helm_release" "docker_registry" {
  name   = "docker-registry"
  chart  = "../../k8s/charts/docker-registry"
  values = [
    "${file("../../k8s/charts/docker-registry/values.yaml")}",
    "${file("../../k8s/charts/docker-registry/values.default.yaml")}"
  ]

  set {
    name  = "ingress.hosts[0]"
    value = "registry.hashcode-2k22.argjolan.dev"
  }
  set {
    name  = "ingress.tls[0].hosts[0]"
    value = "registry.hashcode-2k22.argjolan.dev"
  }
  # set {
  #   name  = "secrets.htpasswd"
  #   value = "${local.registry_username}:${htpasswd_password.registry_password.bcrypt}"
  # }
}

resource "kubernetes_secret" "registry_credentials" {
  metadata {
    name = "hashcode-registry-credentials"
    namespace = "default"
  }

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "registry.${var.project_name}.argjolan.dev" = {
          auth = "${base64encode("${local.registry_username}:${random_password.registry_password.result}")}"
        }
      }
    })
  }

  type = "kubernetes.io/dockerconfigjson"
}

data "scaleway_rdb_instance" "hashcode" {
  name           = "hashcode"
}

resource "random_password" "db_password" {
  length = 16
}

resource "scaleway_rdb_user" "hashcode" {
  instance_id = data.scaleway_rdb_instance.hashcode.id
  name        = "hashcode"
  password    = random_password.db_password.result
  is_admin    = false
}

resource "scaleway_rdb_privilege" "hashcode" {
  instance_id   = data.scaleway_rdb_instance.hashcode.id
  user_name     = scaleway_rdb_user.hashcode.name
  database_name = "hashcode"
  permission    = "all"
}

resource "helm_release" "hashcode_api" {
  name   = "hashcode-api"
  chart  = "../../k8s/charts/hashcode-api"
  values = [
    "${file("../../k8s/charts/hashcode-api/values.yaml")}",
  ]

  set {
    name  = "env.APPCONFIG_SERVICES_DATABASE_HOST"
    value = data.scaleway_rdb_instance.hashcode.endpoint_ip
  }
  set {
    name  = "env.APPCONFIG_SERVICES_DATABASE_USER"
    value = "hashcode"
  }
  set {
    name  = "env.APPCONFIG_SERVICES_DATABASE_PASSWORD"
    value = random_password.db_password.result
  }
  set {
    name  = "env.APPCONFIG_SERVICES_DATABASE_PORT"
    value = data.scaleway_rdb_instance.hashcode.endpoint_port
  }
  set {
    name  = "env.APPCONFIG_SERVICES_DATABASE_DATABASE"
    value = "hashcode"
  }
  set {
    name  = "env.APPCONFIG_SERVICES_ALGORITHM_ALGORITHMS"
    value = jsonencode(local.algorithms)
  }
}
