/**
 * 用户语言偏好管理工具
 * 使用 localStorage 存储用户语言偏好
 */

export interface LanguagePreference {
    code: string
    name: string
}

const PREFERRED_LANGUAGE_KEY = "preferred_language"

const SUPPORTED_LANGUAGES: Record<string, string> = {
    "zh-CN": "简体中文",
    "en": "English",
    "ja": "日本語",
    "ko": "한국어",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
}

/**
 * 获取用户的语言偏好
 * @param defaultLanguage 默认语言，默认为简体中文
 */
export function getPreferredLanguage(defaultLanguage: string = "zh-CN"): string {
    if (typeof window === "undefined") {
        return defaultLanguage
    }

    const saved = localStorage.getItem(PREFERRED_LANGUAGE_KEY)
    if (saved && SUPPORTED_LANGUAGES[saved]) {
        return saved
    }

    // 如果没有保存的偏好，尝试检测浏览器语言
    const browserLang = detectBrowserLanguage()
    if (browserLang && SUPPORTED_LANGUAGES[browserLang]) {
        return browserLang
    }

    return defaultLanguage
}

/**
 * 设置用户的语言偏好
 * @param languageCode 语言代码
 */
export function setPreferredLanguage(languageCode: string): void {
    if (typeof window === "undefined") {
        return
    }

    if (SUPPORTED_LANGUAGES[languageCode]) {
        localStorage.setItem(PREFERRED_LANGUAGE_KEY, languageCode)
        // 触发语言切换事件
        window.dispatchEvent(new CustomEvent("languageChange", {detail: {language: languageCode}}))
    }
}

/**
 * 检测浏览器语言
 */
export function detectBrowserLanguage(): string | null {
    if (typeof window === "undefined" || !navigator.language) {
        return null
    }

    const browserLang = navigator.language.toLowerCase()

    // 直接匹配
    if (SUPPORTED_LANGUAGES[browserLang]) {
        return browserLang
    }

    // 尝试只匹配语言部分 (如 zh-CN -> zh)
    const langParts = browserLang.split("-")
    if (langParts.length > 1) {
        const baseLang = langParts[0]
        // 寻找匹配的语言
        const matched = Object.keys(SUPPORTED_LANGUAGES).find(
            key => key.toLowerCase().startsWith(baseLang)
        )
        if (matched) {
            return matched
        }
    }

    return null
}

/**
 * 获取所有支持的语言列表
 */
export function getSupportedLanguages(): Array<{ code: string; name: string }> {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
        code,
        name,
    }))
}

/**
 * 根据语言代码获取语言名称
 */
export function getLanguageName(code: string): string {
    return SUPPORTED_LANGUAGES[code] || code
}

/**
 * 监听语言变化事件
 */
export function onLanguageChange(callback: (language: string) => void): () => void {
    if (typeof window === "undefined") {
        return () => {
        }
    }

    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<{ language: string }>
        callback(customEvent.detail.language)
    }

    window.addEventListener("languageChange", handler)

    return () => {
        window.removeEventListener("languageChange", handler)
    }
}
