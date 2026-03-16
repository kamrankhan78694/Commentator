import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: [
      'js/main-backup.js',
      'js/main-original.js',
      'js/firebase-service-original-backup.js'
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        firebase: 'readonly',
        FirebaseService: 'readonly',
        CommentatorLogger: 'readonly',
        IPFSService: 'readonly',
        IPFSIntegration: 'readonly',
        SecurityUtils: 'readonly',
        ErrorHandler: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        performance: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        feather: 'readonly',
        ethers: 'readonly',
        scrollY: 'readonly',
        module: 'readonly',
        global: 'readonly',
        process: 'readonly',
        self: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 2 }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn'
    }
  }
];