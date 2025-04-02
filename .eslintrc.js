module.exports = {
  env: {
    node: true, // This tells ESLint that Node.js globals are available
    es2021: true, // Modern JavaScript features
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // You can customize rules here
    "no-unused-vars": "warn",
    "no-console": "off",
  },
};
