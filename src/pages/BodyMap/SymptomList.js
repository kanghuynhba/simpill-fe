import classNames from 'classnames/bind';
import style from './SymptomList.module.scss';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, Nav, Offcanvas, Tab, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { findSymptomListByAreaId, findAreaNameByAreaId } from '~/handler';

const cx = classNames.bind(style);
const SymptomList = forwardRef(
    (
        {
            areaGroup,
            areaId,
            showSymptomList,
            selectedSymptoms,
            setSelectedSymptoms,
            setShowSymptomList,
            className,
        },
        ref,
    ) => {
        // Set the initial state of active symptoms by area 
        const getSelectedSymptomIdsByArea = (areaIdx) => {
            return selectedSymptoms.find((selectedSymptom) => selectedSymptom.areaId === areaIdx)?.symptomIds || [];
        };
        
        const [selectedKey, setSelectedKey] = useState(areaId);
        const [activeSymptomsByAreaId, setActiveSymptomsByAreaId] = useState({areaId: selectedKey, symptoms: getSelectedSymptomIdsByArea(selectedKey)});
        const buttonGroupRef = useRef(null);
        
        
        useEffect(() => {
            setActiveSymptomsByAreaId({ areaId: selectedKey, symptoms: getSelectedSymptomIdsByArea(selectedKey) })
        }, [selectedKey]);

        useEffect(() => {
            setSelectedKey(areaId); 
        }, [areaId])

        // Handle active symptoms and scroll to the last active symptom
        const handleActiveSymptomList = (activeSymptomIds) => {
            setActiveSymptomsByAreaId({areaId:selectedKey, symptoms: [...activeSymptomIds]});
            const lastActiveSymptom = activeSymptomIds[activeSymptomIds.length - 1];
            buttonGroupRef.current.children[(lastActiveSymptom - 1) * 2 + 1]?.scrollIntoView({
                behavior: 'auto',
                block: 'center',
            });
        };

        const handleClose = () => {
            setShowSymptomList(false);
        };

        const handleSelectedKey = (key) => {
            return setSelectedKey(Number(key));
        };

        useEffect(() => {
            let isExist = false;
            for (let i = 0; i < selectedSymptoms?.length; i++) {
                if (selectedSymptoms[i]?.areaId === selectedKey) {
                    isExist = true;
                    setSelectedSymptoms((prev) => {
                        if (activeSymptomsByAreaId.symptoms.length === 0) {
                            prev.splice(i, 1);
                        } else {
                            prev[i] = { areaId: selectedKey, symptoms: activeSymptomsByAreaId.symptoms };
                        }
                        return [...prev];
                    });
                }
            }
            if (!isExist && activeSymptomsByAreaId.symptoms.length !== 0) {
                setSelectedSymptoms((prev) => [...prev, { areaId: selectedKey, symptomIds: activeSymptomsByAreaId.symptoms }]);
            }
        }, [activeSymptomsByAreaId]);

        return (
            <Offcanvas
                id={cx('container', className)}
                placement="bottom"
                show={showSymptomList}
                onHide={handleClose}
                ref={ref}
            >
                <Tab.Container defaultActiveKey={areaId} activeKey={selectedKey} onSelect={(k) => handleSelectedKey(k)}>
                    <Offcanvas.Header style={{ padding: '20px 20px 0', display: 'flex' }}>
                        <Nav variant="tabs">
                            <Offcanvas.Title style={{ fontSize: '20px', fontWeight: 800, display: 'flex' }}>
                                {areaGroup.areaIds.map((areaId, index) => (
                                    <Nav.Link eventKey={areaId} key={index}>
                                        <Nav.Item
                                            style={areaId === selectedKey ? { color: '#14b8a6' } : { color: '#000' }}
                                        >
                                            {findAreaNameByAreaId(areaId)}
                                        </Nav.Item>
                                    </Nav.Link>
                                ))}
                            </Offcanvas.Title>
                        </Nav>
                    </Offcanvas.Header>
                    <Offcanvas.Body style={{ overflow: 'scroll' }}>
                        <Tab.Content>
                            {areaGroup.areaIds.map((areaId, index) => (
                                <Tab.Pane key={index} eventKey={areaId}>
                                    <ToggleButtonGroup
                                        type="checkbox"
                                        value={activeSymptomsByAreaId.symptoms}
                                        onChange={handleActiveSymptomList}
                                        bsPrefix={cx('symptom-list')}
                                        ref={buttonGroupRef}
                                    >
                                        {findSymptomListByAreaId(areaId).map((symptom, symptomIndex) => (
                                            <ToggleButton
                                                key={symptomIndex}
                                                style={{
                                                    backgroundColor: activeSymptomsByAreaId.symptoms.includes(symptom.id)
                                                        ? '#14b8a6'
                                                        : '#f1f5f9',
                                                    color: activeSymptomsByAreaId.symptoms.includes(symptom.id) ? '#fff' : '#000',
                                                    fontWeight: 600,
                                                    fontSize: '16px',
                                                    boxShadow:
                                                        activeSymptomsByAreaId.symptoms.includes(symptom.id) &&
                                                        '0px 0px 0px 4px #14b8a640',
                                                    borderRadius: '14px',
                                                    padding: '14px',
                                                }}
                                                id={'symptom-'.concat(symptom.id)}
                                                value={symptom.id}
                                            >
                                                {symptom.name}
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Tab.Pane>
                            ))}
                        </Tab.Content>
                    </Offcanvas.Body>
                </Tab.Container>
                <Button
                    onClick={handleClose}
                    style={{
                        margin: '8px',
                        padding: '16px 28px',
                        borderColor: '#1e293b',
                        fontWeight: 700,
                        fontSize: '16px',
                        backgroundColor: '#1e293b',
                    }}
                >
                    Done
                    <FontAwesomeIcon style={{ paddingLeft: '10px' }} icon={faCheck} />
                </Button>
            </Offcanvas>
        );
    },
);

export default SymptomList;
