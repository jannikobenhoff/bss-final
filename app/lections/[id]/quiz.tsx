"use client";

import { useState, useEffect } from "react";
import type { Lection, User } from "@/database/schema";
import type { Question } from "@/database/schema";
import type { UserLectionProgress } from "@/database/schema/userLectionProgress";
import { Button } from "@/components/ui/button";
import { HeartIcon, CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeLife } from "@/actions/user";

interface LectionQuizProps {
    lection: Lection;
    questions: Question[];
    initialProgress: UserLectionProgress;
    user: User;
    userId: string;
}

export function LectionQuiz({ lection, questions, initialProgress, user, userId }: LectionQuizProps) {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [hearts, setHearts] = useState(user.lives);
    
    // Wrapper function to update hearts state and database
    const updateHearts = (newHeartCount: number) => {
        setHearts(newHeartCount);
        removeLife()
    };
    const [showFeedback, setShowFeedback] = useState<boolean | null>(null);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(initialProgress.completed);
    
    const totalQuestions = questions.length;
    const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);

    // Update progress in database
    const updateProgress = async (newHearts: number, newProgress: number, completed: boolean) => {
        try {
            const response = await fetch("/api/lections/progress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    lectionId: lection.id,
                    currentHearts: newHearts,
                    progress: newProgress,
                    completed
                }),
            });

            if (!response.ok) {
                console.error("Failed to update progress");
            }

            // Force a refresh to ensure server components re-render
            router.refresh();
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const handleAnswer = (selectedOption: string) => {
        const currentQ = questions[currentQuestion];
        
        // Check if the answer is correct
        const isCorrect = Array.isArray(currentQ.correctAnswer) 
            ? (currentQ.correctAnswer as string[]).includes(selectedOption)
            : currentQ.correctAnswer === selectedOption;

        setShowFeedback(isCorrect);

        if (isCorrect) {
            // Move to next question with a delay to show feedback
            setTimeout(() => {
                if (currentQuestion < totalQuestions - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                    const newProgress = Math.round(((currentQuestion + 1) / totalQuestions) * 100);
                    setProgress(newProgress);
                    updateProgress(hearts, newProgress, false);
                } else {
                    // Quiz completed
                    setIsCompleted(true);
                    updateProgress(hearts, 100, true);
                }
                setShowFeedback(null);
            }, 1000);
        } else {
            // Wrong answer, deduct a heart
            const newHearts = hearts - 1;
            updateHearts(newHearts);
            
            setTimeout(() => {
                setShowFeedback(null);
                
                // Check if out of hearts
                if (newHearts <= 0) {
                    // Reset hearts and progress only
                    updateProgress(5, progress, false);
                    router.push('/lections');
                } else {
                    updateProgress(newHearts, progress, false);
                }
            }, 1000);
        }
    };

    // If the quiz is completed, show a completion screen
    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-sm border text-center">
                <h1 className="text-2xl font-bold mb-6">{lection.title} Completed!</h1>
                <div className="text-5xl mb-8">🎉</div>
                <p className="text-lg mb-6">Congratulations! You've completed this lection.</p>
                <Button onClick={() => router.push('/lections')}>
                    Back to Lections
                </Button>
            </div>
        );
    }

    // If there are no more questions, show completion
    if (currentQuestion >= totalQuestions) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-sm border text-center">
                <h1 className="text-2xl font-bold mb-6">{lection.title} Completed!</h1>
                <div className="text-5xl mb-8">🎉</div>
                <p className="text-lg mb-6">Congratulations! You've completed this lection.</p>
                <Button onClick={() => router.push('/lections')}>
                    Back to Lections
                </Button>
            </div>
        );
    }

    // Current question to display
    const question = questions[currentQuestion];
    const options = question.options as string[];

    return (
        <div className="flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{lection.title}</h1>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-4 mb-4">
                    <div 
                        className="bg-primary h-4 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        Question {currentQuestion + 1} of {totalQuestions}
                    </span>
                    
                    {/* Hearts/lives display */}
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <HeartIcon 
                                key={i} 
                                className={`h-5 w-5 ${i < hearts ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`} 
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Question area */}
            <div className="bg-card p-6 rounded-lg border mb-6 shadow-sm">
                <h2 className="text-xl font-medium mb-8">{question.questionText}</h2>
                
                {/* Answer options */}
                <div className="flex flex-col gap-3">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => !showFeedback && handleAnswer(option)}
                            className={`p-4 text-left rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors
                                ${showFeedback === true && option === question.correctAnswer ? 'bg-green-100 border-green-500' : ''}
                                ${showFeedback === false && option === question.correctAnswer ? 'bg-green-100 border-green-500' : ''}
                                ${showFeedback === false && Array.isArray(question.correctAnswer) 
                                  ? (question.correctAnswer as string[]).includes(option) 
                                    ? 'bg-green-100 border-green-500' 
                                    : ''
                                  : ''}
                                ${showFeedback === false && option !== question.correctAnswer && !Array.isArray(question.correctAnswer) ? 'bg-red-100 border-red-500' : ''}
                                ${showFeedback !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            disabled={showFeedback !== null}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showFeedback !== null && (
                                    Array.isArray(question.correctAnswer) 
                                        ? (question.correctAnswer as string[]).includes(option) && <CheckIcon className="h-5 w-5 text-green-600" />
                                        : option === question.correctAnswer 
                                            ? <CheckIcon className="h-5 w-5 text-green-600" /> 
                                            : showFeedback === false && <XIcon className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 