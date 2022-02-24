data "scaleway_k8s_cluster" "hashcode" { # Total 4530 CPUs with current quotas
  name    = "${var.project_name}"
}

resource "local_file" "kubeconfig" {
  content     = "${data.scaleway_k8s_cluster.hashcode.kubeconfig[0].config_file}" #${join(",", keys(scaleway_k8s_cluster.hashcode.kubeconfig[0]))}"
  filename    = "../config_hashcode"
}
