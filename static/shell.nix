with (import <nixpkgs> {});
with (import /home/uwap/Projekte/Screeps/Branch1/yarn2nix { inherit pkgs; });
stdenv.mkDerivation rec {
  name = "env";
  env = buildEnv { name = name; paths = buildInputs; };
  buildInputs = with pkgs.nodePackages; [
    yarn nodejs yarn2nix flow
  ];
}
