module.exports = {
    // other Jest configuration options...
    reporters: [
      "default",
      ["jest-spec-reporter", { "suiteNameTemplate": "{filepath}" }]
    ]
  };