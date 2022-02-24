resource "helm_release" "hashcode_worker" {
  for_each = locals.algorithms

  name   = "hashcode-worker-${each.id}"
  chart  = "../../k8s/charts/hashcode-worker"
  values = [
    "${file("../../k8s/charts/hashcode-worker/values.yaml")}",
  ]

  set {
    name = "command"
    value = each.command
  }

  set {
    name = "replicas"
    value = each.cpu
  }

  set {
    name = "image.tag"
    value = each.version
  }
}
