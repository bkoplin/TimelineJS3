/*  I18NMixins
    assumes that its class has an options object with a Language instance
================================================== */
import { LANGUAGES } from './LANGUAGES'
class I18NMixins {
  setLanguage() {
    this.language = LANGUAGES.en
  }

  getLanguage() {
    return LANGUAGES.en
  }

  _(msg: keyof typeof LANGUAGES.en) {
    return LANGUAGES.en[msg]
  }
}

export { I18NMixins }
