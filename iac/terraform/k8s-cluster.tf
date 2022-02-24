resource "scaleway_k8s_cluster" "hashcode" { # Total 4530 CPUs with current quotas
  name    = "${var.project_name}"
  version = "1.23.2"
  cni     = "cilium"
}

resource "scaleway_k8s_pool" "gp1_xs" { # 4 x 200 Cores = 800
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "GP1-XS"
  node_type   = "GP1-XS"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 1
  max_size    = 200
}

resource "scaleway_k8s_pool" "gp1_s" { # 8 x 100 Cores = 800
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "GP1-S"
  node_type   = "GP1-S"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 100
}

resource "scaleway_k8s_pool" "gp1_m" { # 16 x 30 Cores = 480
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "GP1-M"
  node_type   = "GP1-M"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 30
}

resource "scaleway_k8s_pool" "gp1_l" { # 5 x 32 Cores = 160
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "GP1-L"
  node_type   = "GP1-L"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 5
}

resource "scaleway_k8s_pool" "gp1_xl" { # 5 x 48 Cores = 240
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "GP1-XL"
  node_type   = "GP1-XL"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 5
}

resource "scaleway_k8s_pool" "dev1_m" { # 3 x 250 Cores = 750
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "DEV1-M"
  node_type   = "DEV1-M"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 250
}

resource "scaleway_k8s_pool" "dev1_l" { # 4 x 200 Cores = 800
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "DEV1-L"
  node_type   = "DEV1-L"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 200
}

resource "scaleway_k8s_pool" "dev1_xl" { # 4 x 125 Cores = 500
  cluster_id  = scaleway_k8s_cluster.hashcode.id
  name        = "DEV1-XL"
  node_type   = "DEV1-XL"
  size        = 1
  autoscaling = true
  autohealing = true
  min_size    = 0
  max_size    = 125
}

resource "local_file" "kubeconfig" {
  content     = "${scaleway_k8s_cluster.hashcode.kubeconfig[0].config_file}" #${join(",", keys(scaleway_k8s_cluster.hashcode.kubeconfig[0]))}"
  filename    = "config_hashcode"
}

resource "time_sleep" "wait_for_kubeconfig" {
  depends_on = [
    local_file.kubeconfig,
  ]

  create_duration = "30s"
}
