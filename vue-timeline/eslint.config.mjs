import antfu from '@antfu/eslint-config'

export default antfu(
  {
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
