"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Link, Copy, Trash2, Check} from "lucide-react";
import {useShortUrl} from "@/hooks/use-short-url";

export function UrlShortener() {
    const [longUrl, setLongUrl] = useState("");
    const [customCode, setCustomCode] = useState("");
    const [copied, setCopied] = useState(false);
    const {createShortUrl, deleteShortUrl, shortUrl, isLoading, error} = useShortUrl();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!longUrl.trim()) return;

        await createShortUrl(longUrl, customCode || undefined);
    };

    const handleCopy = async () => {
        if (shortUrl?.short_url) {
            await navigator.clipboard.writeText(shortUrl.short_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDelete = async () => {
        if (shortUrl?.short_code && confirm("Delete this short URL?")) {
            await deleteShortUrl(shortUrl.short_code);
            setLongUrl("");
            setCustomCode("");
        }
    };

    return (
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5"/>
                    URL Shortener
                </CardTitle>
                <CardDescription>Create short, shareable links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="longUrl">Long URL *</Label>
                        <Input
                            id="longUrl"
                            type="url"
                            placeholder="https://example.com/very-long-url"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customCode">Custom Code (Optional)</Label>
                        <Input
                            id="customCode"
                            type="text"
                            placeholder="my-custom-code"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Leave empty for auto-generated code
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Creating..." : "Create Short URL"}
                    </Button>
                </form>

                {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                    </Alert>
                )}

                {shortUrl && (
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="space-y-1">
                            <Label>Short URL:</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={shortUrl.short_url}
                                    readOnly
                                    className="bg-slate-50 dark:bg-slate-800 font-mono text-sm"
                                />
                                <Button onClick={handleCopy} variant="outline" size="icon">
                                    {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                                </Button>
                                <Button onClick={handleDelete} variant="outline" size="icon"
                                        className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Original URL:</Label>
                            <Input
                                value={shortUrl.long_url}
                                readOnly
                                className="bg-slate-50 dark:bg-slate-800 font-mono text-sm break-all"
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                            <span>Created: {new Date(shortUrl.created_at).toLocaleString()}</span>
                            {copied && <span className="text-green-600 dark:text-green-400">Copied!</span>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}