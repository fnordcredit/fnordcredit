{
  description = "Fnordcredit Cash Solutions";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell = pkgs.mkShell {
        nativeBuildInputs = [ pkgs.bashInteractive ];
        buildInputs = with pkgs; [
          nodePackages.prisma
          (yarn.override { nodejs = nodejs_20; }) nodejs_20
          nodePackages.typescript
          nodePackages.typescript-language-server
          nodePackages."@tailwindcss/language-server"
        ];
        shellHook = with pkgs; ''
          export PRISMA_MIGRATION_ENGINE_BINARY="${prisma-engines}/bin/migration-engine"
          export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
          export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
          export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
          export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
          export POSTGRES_PRISMA_URL=postgres://fnordcredit:fnordcredit@localhost/fnordcredit
          export POSTGRES_URL_NON_POOLING=postgres://fnordcredit:fnordcredit@localhost/fnordcredit
        '';
      };
    });
}
