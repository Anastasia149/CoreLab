function normalizeAnswers(answers) {
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
        return {};
    }
    const out = {};
    for (const [questionId, value] of Object.entries(answers)) {
        if (!questionId) continue;
        const ids = Array.isArray(value) ? value : [value];
        out[String(questionId)] = ids.map(String).filter(Boolean);
    }
    return out;
}

function parseQuestions(rawContent) {
    if (!rawContent || typeof rawContent !== 'string') {
        throw new Error('Пустое содержимое теста');
    }
    const parsed = JSON.parse(rawContent);
    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Тест не содержит вопросов');
    }
    return parsed;
}

function isQuestionCorrect(question, selectedOptionIds) {
    const correctIds = (question.options || [])
        .filter((o) => o.isCorrect)
        .map((o) => String(o.id))
        .sort();
    const selected = [...selectedOptionIds].map(String).sort();

    if (correctIds.length === 0) return false;
    if (correctIds.length !== selected.length) return false;
    return correctIds.every((id, index) => id === selected[index]);
}

function gradeTest(questions, rawAnswers) {
    const answers = normalizeAnswers(rawAnswers);
    const totalCount = questions.length;
    let correctCount = 0;
    const storedAnswers = {};

    for (const question of questions) {
        const qid = String(question.id);
        const selected = answers[qid] || [];
        storedAnswers[qid] = selected;

        if (question.isRequired && selected.length === 0) {
            const err = new Error('Ответьте на все обязательные вопросы');
            err.status = 400;
            throw err;
        }

        if (isQuestionCorrect(question, selected)) {
            correctCount += 1;
        }
    }

    const storedContent = JSON.stringify({
        kind: 'test',
        answers: storedAnswers,
        correctCount,
        totalCount,
    });

    return { correctCount, totalCount, storedContent };
}

function sanitizeTestContentForStudent(rawContent) {
    const questions = parseQuestions(rawContent);
    const safe = questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type === 'multiple' ? 'multiple' : 'single',
        options: (q.options || []).map((o) => ({
            id: o.id,
            text: o.text,
        })),
        isRequired: !!q.isRequired,
        imageUrl: q.imageUrl || null,
    }));
    return JSON.stringify(safe);
}

module.exports = {
    gradeTest,
    parseQuestions,
    sanitizeTestContentForStudent,
    isQuestionCorrect,
};
