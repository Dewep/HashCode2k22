resource "helm_release" "hashcode_worker" {
  for_each = { for algorithms in local.algorithms : algorithms.id => algorithms }

  timeout = 600

  name   = "hashcode-worker-${each.value.id}"
  chart  = "../../k8s/charts/hashcode-worker"
  values = [
    "${file("../../k8s/charts/hashcode-worker/values.yaml")}",
  ]

  set {
    name = "path"
    value = each.value.path
  }
  set {
    name = "id"
    value = each.value.id
  }
  set {
    name = "input"
    value = each.value.input
  }
  set {
    name = "command"
    value = each.value.command
  }

  set {
    name = "replicas"
    value = each.value.cpu
  }

  set {
    name = "image.tag"
    value = each.value.version
  }
}
