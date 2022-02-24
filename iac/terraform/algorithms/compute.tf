resource "helm_release" "hashcode_worker" {
  for_each = { for algorithms in local.algorithms : algorithms.id => algorithms }

  name   = "hashcode-worker-${each.value.id}"
  chart  = "../../k8s/charts/hashcode-worker"
  values = [
    "${file("../../k8s/charts/hashcode-worker/values.yaml")}",
  ]

  set {
    name = "command"
    value = "${split(" ", each.value.command)}"
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
