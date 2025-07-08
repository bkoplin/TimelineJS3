import antfu from '@antfu/eslint-config'
import globals from './.eslintrc-auto-import.json' with { type: 'json' }

export default antfu(
  {
    languageOptions: globals,
    rules: {
      'style/no-multiple-empty-lines': 'error',
      'vue/no-unused-refs': 'error',
      'vue/max-attributes-per-line': [
        'error',
        {
          multiline: 1,
        },
      ],
      'style/function-call-argument-newline': ['error', 'consistent'],
    },
  },
)
