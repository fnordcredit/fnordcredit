with (import <nixpkgs> {});
stdenv.mkDerivation rec {
  name = "env";
  env = buildEnv { name = name; paths = buildInputs; };
  buildInputs = [
    (yarn.override { nodejs = nodejs-16_x; }) nodejs-16_x flow 
  ];
}
