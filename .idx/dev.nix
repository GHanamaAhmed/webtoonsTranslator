{ pkgs }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.awscli
    pkgs.aws-sam-cli
    pkgs.docker
    pkgs.openssl # This is the package for libssl
  ];
  idx.extensions = [

  ];
  services.docker.enable = true;

  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
