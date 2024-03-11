import React, { useState, useCallback, useMemo } from "react";
import diseasesData from "@/pages/data.json";
import { Container, Row, Col, Form, Button, Alert, Badge } from 'react-bootstrap';

const Home = () => {
    const [symptoms, setSymptoms] = useState("");
    const [matchedDiseases, setMatchedDiseases] = useState([]);
    const [error, setError] = useState("");
    const [suggestedSymptoms, setSuggestedSymptoms] = useState([]);

    const symptomIndex = useMemo(() => diseasesData.diseases.reduce((index, disease) => {
        disease.symptoms.forEach(symptom => {
            const symptomLower = symptom.toLowerCase();
            index[symptomLower] = [...(index[symptomLower] || []), disease];
        });
        return index;
    }, {}), [diseasesData]);

    const calculateMatchPercentage = useCallback((inputSymptoms, diseaseSymptoms) => {
        const cleanedInputSymptoms = inputSymptoms.toLowerCase().split(",").map(symptom => symptom.trim());
        const matchedSymptoms = cleanedInputSymptoms.filter(symptom => diseaseSymptoms.includes(symptom));
        return (matchedSymptoms.length / diseaseSymptoms.length) * 100 || 0;
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
        <>
            <Container fluid>
                <Row>
                    <Col>
                        <header>Disease Finder</header>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row className="justify-content-center mt-5">
                    <Col md={6}>
                        <h1>Let's check your symptoms</h1>
                        <p>Start typing or search for a symptom from the list below</p>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="symptoms">
                                <Form.Control
                                    className="symptoms_input"
                                    type="text"
                                    value={symptoms}
                                    onChange={handleInputChange}
                                    placeholder="Enter symptoms"
                                    autoComplete="off"
                                    required
                                />
                            </Form.Group>
                            {suggestedSymptoms.length > 0 && (
                                <SuggestedSymptoms
                                    suggestedSymptoms={suggestedSymptoms}
                                    handleSuggestionClick={handleSuggestionClick}
                                />
                            )}
                            <CommonSymptoms handleSuggestionClick={handleSuggestionClick} />
                            <div className="d-grid gap-2">
                                <Button variant="primary" type="submit" size="lg" className="fs-6 fw-semibold">
                                    Find Disease
                                </Button>
                                <Button variant="secondary" onClick={handleClear} size="lg" className="fs-6 fw-semibold">Clear</Button>
                            </div>
                        </Form>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {matchedDiseases.length > 0 ? (
                            <div className="my-4">
                                <h3>Matched Diseases:</h3>
                                <MatchedDiseases matchedDiseases={matchedDiseases} />
                            </div>
                        ) : null}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

const SuggestedSymptoms = React.memo(({ suggestedSymptoms, handleSuggestionClick }) => (
    <ul className="my-4 p-0">
        {suggestedSymptoms.map((suggestion, index) => (
            <Badge
                key={index}
                bg="light"
                text="dark"
                className="me-2 mb-2 p-3 text-capitalize"
                style={{ cursor: "pointer" }}
                onClick={() => handleSuggestionClick(suggestion)}
            >
                {suggestion}
            </Badge>
        ))}
    </ul>
));

const MatchedDiseases = React.memo(({ matchedDiseases }) => (
    <ul className="matched_diseases">
        {matchedDiseases.map((disease, index) => (
            <li key={index}>
                <b>{disease.name}:</b> {disease.matchPercentage.toFixed(2)}%
            </li>
        ))}
    </ul>
));

const CommonSymptoms = React.memo(({ handleSuggestionClick }) => {
    const commonSymptomsList = [
        "Headache",
        "Fatigue",
        "Cough",
        "Shortness of breath",
        "Sore throat",
        "Muscle aches",
        "Chills",
        "Loss of smell or taste"
    ];

    const renderSymptoms = useMemo(() => commonSymptomsList.map((symptom, index) => (
        <Badge
            key={index}
            bg="light"
            text="dark"
            className="me-2 mb-2 p-3 fs-6 fw-normal"
            style={{ cursor: "pointer" }}
            onClick={() => handleSuggestionClick(symptom.toLowerCase())}
        >
            {symptom}
        </Badge>
    )), [commonSymptomsList, handleSuggestionClick]);

    return (
        <div className="my-4">
            <h3>Common symptoms</h3>
            {renderSymptoms}
        </div>
    );
});

export default Home;
