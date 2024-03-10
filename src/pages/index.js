import React, { useState } from "react";
import diseasesData from "@/pages/data.json";

const Home = () => {
    const [symptoms, setSymptoms] = useState("");
    const [matchedDiseases, setMatchedDiseases] = useState([]);
    const [error, setError] = useState("");
    const [suggestedSymptoms, setSuggestedSymptoms] = useState([]);

    const calculateMatchPercentage = (inputSymptoms, diseaseSymptoms) => {
        const cleanedInputSymptoms = inputSymptoms.toLowerCase().split(",").map(symptom => symptom.trim());
        const matchedSymptoms = cleanedInputSymptoms.filter(symptom => diseaseSymptoms.includes(symptom));
        return (matchedSymptoms.length / diseaseSymptoms.length) * 100 || 0;
    };

    const findMatchingDiseases = () => {
        const newMatchedDiseases = diseasesData.diseases.map(disease => ({
            name: disease.name,
            matchPercentage: calculateMatchPercentage(symptoms, disease.symptoms),
        })).filter(disease => disease.matchPercentage > 0);

        return newMatchedDiseases.length ? newMatchedDiseases : null;
    };

    const handleInputChange = (e) => {
        const input = e.target.value;
        setSymptoms(input);

        const lastSymptom = input.substring(input.lastIndexOf(",") + 1).trim();
        const suggested = lastSymptom
            ? diseasesData.diseases.flatMap(disease => disease.symptoms.filter(symptom => symptom.toLowerCase().startsWith(lastSymptom.toLowerCase())))
            : [];
        setSuggestedSymptoms([...new Set(suggested)]);
    };

    const handleSuggestionClick = (suggestion) => {
        const comma = symptoms.includes(",") ? "" : ",";
        setSymptoms(symptoms.replace(/[^,]+$/, `${suggestion}${comma}`));
        setSuggestedSymptoms([]);
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!symptoms) {
            setError("Please enter symptoms.");
            return;
        }

        setError("");

        const newMatchedDiseases = findMatchingDiseases();

        if (!newMatchedDiseases) {
            setError("No matching diseases found.");
        } else {
            setMatchedDiseases(newMatchedDiseases);
        }
    };

    return (
        <div>
            <h1>Find your disease</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter symptoms (comma-separated):
                    <input
                        type="text"
                        value={symptoms}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="submit">Find Disease</button>
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {suggestedSymptoms.length > 0 && (
                <ul>
                    {suggestedSymptoms.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)} style={{ cursor: "pointer" }}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
            {matchedDiseases.length > 0 && (
                <div>
                    <h2>Matched Diseases:</h2>
                    <ul>
                        {matchedDiseases.map((disease, index) => (
                            <li key={index}>
                                {disease.name}: {disease.matchPercentage.toFixed(2)}%
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Home;
