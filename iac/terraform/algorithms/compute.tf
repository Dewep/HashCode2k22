resource "helm_release" "hashcode_worker" {
  for_each = locals.algorithms

  name   = "hashcode-worker-${each.value.id}"
  chart  = "../../k8s/charts/hashcode-worker"
  values = [
    "${file("../../k8s/charts/hashcode-worker/values.yaml")}",
  ]

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