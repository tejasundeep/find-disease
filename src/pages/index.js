import React, { useState, useCallback, useMemo } from "react";
import diseasesData from "@/pages/data.json";

const Home = () => {
    const [symptoms, setSymptoms] = useState("");
    const [matchedDiseases, setMatchedDiseases] = useState([]);
    const [error, setError] = useState("");
    const [suggestedSymptoms, setSuggestedSymptoms] = useState([]);

    const symptomIndex = useMemo(() => {
        const index = {};
        diseasesData.diseases.forEach(disease => {
            disease.symptoms.forEach(symptom => {
                const symptomLower = symptom.toLowerCase();
                if (!index[symptomLower]) {
                    index[symptomLower] = [];
                }
                index[symptomLower].push(disease);
            });
        });
        return index;
    }, [diseasesData]);

    const calculateMatchPercentage = useMemo(() => {
        return (inputSymptoms, diseaseSymptoms) => {
            const cleanedInputSymptoms = inputSymptoms.toLowerCase().split(",").map(symptom => symptom.trim());
            const matchedSymptoms = cleanedInputSymptoms.filter(symptom => diseaseSymptoms.includes(symptom));
            return (matchedSymptoms.length / diseaseSymptoms.length) * 100 || 0;
        };
    }, []);

    const findMatchingDiseases = useCallback(() => {
        const cleanedInputSymptoms = symptoms.toLowerCase().split(",").map(symptom => symptom.trim());
        const matchedDiseasesSet = new Set();
        cleanedInputSymptoms.forEach(symptom => {
            const matchingDiseases = symptomIndex[symptom];
            if (matchingDiseases) {
                matchingDiseases.forEach(disease => matchedDiseasesSet.add(disease));
            }
        });
        const newMatchedDiseases = Array.from(matchedDiseasesSet).map(disease => ({
            name: disease.name,
            matchPercentage: calculateMatchPercentage(symptoms, disease.symptoms),
        })).filter(disease => disease.matchPercentage > 0);
        return newMatchedDiseases.length ? newMatchedDiseases : null;
    }, [symptoms, symptomIndex, calculateMatchPercentage]);

    const handleInputChange = useCallback((e) => {
        const input = e.target.value;
        setSymptoms(input);

        const lastSymptom = input.substring(input.lastIndexOf(",") + 1).trim();
        const suggested = lastSymptom
            ? diseasesData.diseases.flatMap(disease => disease.symptoms.filter(symptom => symptom.toLowerCase().startsWith(lastSymptom.toLowerCase())))
            : [];
        setSuggestedSymptoms([...new Set(suggested)]);
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        const lastCommaIndex = symptoms.lastIndexOf(",");
        const newSymptoms = lastCommaIndex !== -1 ? `${symptoms.substring(0, lastCommaIndex + 1)} ${suggestion}, ` : `${suggestion}, `;
        setSymptoms(newSymptoms);
        setSuggestedSymptoms([]);
    }, [symptoms]);

    const handleSubmit = useCallback((e) => {
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
    }, [symptoms, findMatchingDiseases]);

    const handleClear = useCallback(() => {
        setSymptoms("");
        setMatchedDiseases([]);
        setError("");
    }, []);

    return (
        <div>
            <h1>Let's check your symptoms</h1>
            <p>Start typing or search for a symptom from the list below</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={symptoms}
                    onChange={handleInputChange}
                    placeholder="Enter symptoms"
                    required
                />
                <button type="submit">Find Disease</button>
                <button type="button" onClick={handleClear}>Clear</button>
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {suggestedSymptoms.length > 0 && (
                <SuggestedSymptoms
                    suggestedSymptoms={suggestedSymptoms}
                    handleSuggestionClick={handleSuggestionClick}
                />
            )}
            {matchedDiseases.length > 0 ? (
                <div>
                    <h2>Matched Diseases:</h2>
                    <MatchedDiseases matchedDiseases={matchedDiseases} />
                </div>
            ) : (
                <CommonSymptoms handleSuggestionClick={handleSuggestionClick} />
            )}
        </div>
    );
};

const SuggestedSymptoms = React.memo(({ suggestedSymptoms, handleSuggestionClick }) => {
    return (
        <ul>
            {suggestedSymptoms.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)} style={{ cursor: "pointer" }}>
                    {suggestion}
                </li>
            ))}
        </ul>
    );
});

const MatchedDiseases = React.memo(({ matchedDiseases }) => {
    return (
        <ul>
            {matchedDiseases.map((disease, index) => (
                <li key={index}>
                    {disease.name}: {disease.matchPercentage.toFixed(2)}%
                </li>
            ))}
        </ul>
    );
});

const CommonSymptoms = React.memo(({ handleSuggestionClick }) => {
    const commonSymptomsList = [
        "headache",
        "fatigue",
        "cough",
        "shortness of breath",
        "sore throat",
        "muscle aches",
        "chills",
        "loss of smell or taste"
    ];

    return (
        <div>
            <h3>Common symptoms</h3>
            <ul>
                {commonSymptomsList.map((symptom, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(symptom)} style={{ cursor: "pointer" }}>
                        {symptom}
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default Home;
