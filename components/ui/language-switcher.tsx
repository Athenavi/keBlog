"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Globe} from "lucide-react"
import {useToast} from "@/hooks/use-toast"

interface Language {
    code: string
    name: string
    flag: string
}

const SUPPORTED_LANGUAGES: Language[] = [
    {code: "zh-CN", name: "简体中文", flag: "🇨🇳"},
    {code: "en", name: "English", flag: "🇺🇸"},
    {code: "ja", name: "日本語", flag: "🇯🇵"},
    {code: "ko", name: "한국어", flag: "🇰🇷"},
    {code: "fr", name: "Français", flag: "🇫🇷"},
    {code: "de", name: "Deutsch", flag: "🇩🇪"},
    {code: "es", name: "Español", flag: "🇪🇸"},
]

interface LanguageSwitcherProps {
    currentLanguage?: string
    onLanguageChange?: (language: string) => void
    articleId?: number
    showTranslateOption?: boolean
}

export function LanguageSwitcher({
                                     currentLanguage = "zh-CN",
                                     onLanguageChange,
                                     articleId,
                                     showTranslateOption = true,
                                 }: LanguageSwitcherProps) {
    const [selectedLang, setSelectedLang] = useState(currentLanguage)
    const [isTranslating, setIsTranslating] = useState(false)
    const {toast} = useToast()

    useEffect(() => {
        // 从 localStorage 读取用户语言偏好
        const savedLanguage = localStorage.getItem("preferred_language") || currentLanguage
        setSelectedLang(savedLanguage)
    }, [currentLanguage])

    const handleLanguageSelect = async (langCode: string) => {
        setSelectedLang(langCode)

        // 保存用户语言偏好
        localStorage.setItem("preferred_language", langCode)

        // 如果提供了回调，调用它
        if (onLanguageChange) {
            onLanguageChange(langCode)
        }

        // 如果需要翻译且提供了文章 ID
        if (showTranslateOption && articleId && langCode !== currentLanguage) {
            await checkAndTranslate(articleId, langCode)
        }
    }

    const checkAndTranslate = async (articleId: number, targetLang: string) => {
        try {
            setIsTranslating(true)

            // 检查是否已有该语言的翻译
            const response = await fetch(`/api/articles/${articleId}/i18n?language=${targetLang}`)
            const data = await response.json()

            if (!data.exists && data.needsTranslation) {
                // 需要翻译，调用翻译 API
                const translateResponse = await fetch(`/api/articles/${articleId}/translate`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({targetLanguage: targetLang}),
                })

                if (translateResponse.ok) {
                    toast({
                        title: "翻译成功",
                        description: `文章已翻译成 ${getLanguageName(targetLang)}`,
                    })
                    // 刷新页面以显示新翻译
                    window.location.reload()
                } else {
                    throw new Error("翻译失败")
                }
            }
        } catch (error) {
            console.error("Translation check failed:", error)
            toast({
                title: "翻译检查失败",
                description: "无法检查或创建翻译",
                variant: "destructive",
            })
        } finally {
            setIsTranslating(false)
        }
    }

    const getLanguageName = (code: string) => {
        return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code
    }

    const currentLanguageName = getLanguageName(selectedLang)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isTranslating}
                    className="gap-2"
                >
                    <Globe className="w-4 h-4"/>
                    {isTranslating ? "翻译中..." : currentLanguageName}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className="cursor-pointer gap-2"
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {selectedLang === lang.code && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
