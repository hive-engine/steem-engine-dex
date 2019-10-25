module.exports = function (wallaby) {

    return {
      files: [
        '!**/*.css',
        'src/**/*.ts',
        'src/**/*.html',
        'test/unit/helpers.ts',
        'test/unit/mock-data/**/*.ts',
        'test/unit/stubs/**/*.ts',
        'aurelia_project/environments/**/*.ts',
        'test/jest-pretest.ts',
        'tsconfig.json'
      ],
  
      tests: [
        'test/unit/**/*.spec.ts'
      ],
  
      compilers: {
        '**/*.ts': wallaby.compilers.typeScript({ module: 'commonjs' })
      },
  
      env: {
        runner: 'node', 
        type: 'node'
      },
  
      testFramework: 'jest',
  
      debug: true
    };
  };
  