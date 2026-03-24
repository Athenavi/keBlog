"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Flag} from "lucide-react";

interface ReportButtonProps {
    contentType: 'Article' | 'Comment';
    contentId: number;
}

export function ReportButton({contentType, contentId}: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for reporting");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    content_type: contentType,
                    content_id: contentId,
                    reason: reason.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit report');
            }

            setSuccess(true);
            setReason("");

            // Close dialog after 2 seconds
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-slate-500 hover:text-red-600"
            >
                <Flag className="w-4 h-4 mr-1"/>
                Report
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Report {contentType}</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for reporting this {contentType.toLowerCase()}.
                            Our team will review your report.
                        </DialogDescription>
                    </DialogHeader>

                    {success && (
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                Report submitted successfully! Thank you for helping keep our community safe.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!success && (
                        <>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason *</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please describe why you're reporting this content..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                    <AlertDescription className="text-red-700 dark:text-red-400">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !reason.trim()}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Report"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}