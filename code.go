func CalculateMultipleChoiceScore(question Question, selectedIDs []string) float64 {
	selected := make(map[string]bool)
	for _, id := range selectedIDs {
		selected[id] = true
	}
	correct := 0
	correctAll := 0
	wrong := 0
	N := len(question.Options)
	for _, opt := range question.Options {
		if opt.IsCorrect {
			correctAll++
			if selected[opt.ID] {
				correct++
			}
		} else {
			if selected[opt.ID] {
				wrong++
			}
		}
	}
	score := question.Value * 
		math.Max(0, float64(correct)/float64(correctAll)-float64(wrong)/float64(N-correctAll))
	return score
}
func CalculateNumericAnswerScore(question Question, userAnswer float64) float64 {
	if question.Type != "numeric" {
		return 0
	}
	tolerance := question.Answer * question.TolerancePercent / 100.0

	if math.Abs(question.Answer-userAnswer) <= tolerance {
		return question.Value
	}
	return 0
}
