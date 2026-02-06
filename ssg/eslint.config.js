import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-webpack/eslint'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []
  },
  pluginQuasar.configs.recommended(),
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  vueTsConfigs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },
    rules: {
      curly: ['error', 'multi-line'],
      eqeqeq: ['error', 'always'],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info', 'debug'],
        },
      ],

      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: true,
          allowNullableString: true,
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            // Index signature
            'signature',
            // Fields
            'private-static-field',
            'protected-static-field',
            'public-static-field',
            'private-decorated-field',
            'protected-decorated-field',
            'public-decorated-field',
            'instance-field',
            'protected-abstract-field',
            'public-abstract-field',
            'private-field',
            'protected-field',
            'public-field',
            'static-field',
            'instance-field',
            'abstract-field',
            'decorated-field',
            'field',
            // Static
            'private-static-method',
            'protected-static-method',
            'public-static-method',
            // Constructors
            'private-constructor',
            'protected-constructor',
            'public-constructor',
            'constructor',
            // Methods
            'private-decorated-method',
            'protected-decorated-method',
            'public-decorated-method',
            'instance-method',
            'protected-abstract-method',
            'public-abstract-method',
            'private-method',
            'protected-method',
            'public-method',
            'static-method',
            'instance-method',
            'abstract-method',
            'decorated-method',
            'method',
          ],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'property',
          modifiers: ['static'],
          format: ['UPPER_CASE'],
        },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            Omit: 'Prefer `OmitStrict`.',
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          // Starting with underscore
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },

  {
    files: ['src-pwa/custom-service-worker.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  prettierSkipFormatting, // optional, if you want prettier
)
