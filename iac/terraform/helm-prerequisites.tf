resource "kubernetes_namespace" "cluster_issuer" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    time_sleep.wait_for_kubeconfig,
    scaleway_k8s_cluster.hashcode,
    local_file.kubeconfig
  ]
  metadata {
    name = "cluster-issuer"
  }
}

resource "time_sleep" "wait_for_cluster_issuer_namespace" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    kubernetes_namespace.cluster_issuer,
  ]

  create_duration = "20s"
}

resource "kubernetes_namespace" "hashcode" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    time_sleep.wait_for_kubeconfig,
    scaleway_k8s_cluster.hashcode,
    kubernetes_namespace.cluster_issuer
  ]
  metadata {
    name = "hashcode"
  }
}

resource "time_sleep" "wait_for_hashcode_namespace" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    kubernetes_namespace.hashcode,
  ]

  create_duration = "20s"
}

resource "helm_release" "cert_manager" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    time_sleep.wait_for_kubeconfig,
    local_file.kubeconfig
  ]

  name      = "cert-manager"
  chart     = "../k8s/charts/cert-manager"
}

resource "helm_release" "cluster_issuer" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    time_sleep.wait_for_cluster_issuer_namespace,
    time_sleep.wait_for_kubeconfig,
    helm_release.cert_manager
  ]
  name      = "cluster-issuer"
  namespace = "cluster-issuer"
  chart     = "../k8s/charts/cluster-issuer"
}

resource "random_password" "registry_password" {
  length = 30
}

resource "htpasswd_password" "registry_password" {
  password = random_password.registry_password.result
}

resource "helm_release" "docker_registry" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    time_sleep.wait_for_kubeconfig,
    local_file.kubeconfig
  ]
  name   = "dockre-registry"
  chart  = "../k8s/charts/docker-registry"
  values = [
    "${file("../k8s/charts/docker-registry/values.yaml")}",
    "${file("../k8s/charts/docker-registry/values.default.yaml")}"
  ]

  set {
    name  = "ingress.hosts[0]"
    value = "registry.${var.project_name}.argjolan.dev"
  }
  set {
    name  = "ingress.tls[0].hosts[0]"
    value = "registry.${var.project_name}.argjolan.dev"
  }
  set {
    name  = "secrets.htpasswd"
    value = "${local.registry_username}:${htpasswd_password.registry_password.bcrypt}"
  }
}

resource "kubernetes_secret" "registry_credentials" {
  depends_on = [
    scaleway_k8s_pool.gp1_xs,
    time_sleep.wait_for_kubeconfig,
    time_sleep.wait_for_hashcode_namespace,
    local_file.kubeconfig
  ]
  metadata {
    name = "hashcode-registry-credentials"
    namespace = "hashcode"
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