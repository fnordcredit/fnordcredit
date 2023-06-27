module.exports = {
  extends: ["eslint:recommended", "next/core-web-vitals", "prettier"],
  plugins: [],
  rules: {
    "comma-dangle": [
      2,
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "never",
      },
    ],
    "space-before-function-paren": 0,
    "require-atomic-updates": 0,
    "no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
  },
  overrides: [
    {
      // Force the setting of a swagger description on each api endpoint
      files: ["app/api/**/*.ts"],
      plugins: ["jsdoc"],
      rules: {
        "jsdoc/no-missing-syntax": [
          "error",
          {
            contexts: [
              {
                comment: "JsdocBlock:has(JsdocTag[tag=swagger])",
                context: "any",
                message:
                  "@swagger documentation is required on each API. Check this out for syntax info: https://github.com/jellydn/next-swagger-doc",
              },
            ],
          },
        ],
      },
    },
  ],
};
