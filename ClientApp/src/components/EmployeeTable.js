import React, { useState, useEffect } from 'react';
import './EmployeeTable.css';


function AddEmployee(props) {
    const [employeeName, setEmployeeName] = useState('');
    const [employeeValue, setEmployeeValue] = useState('');

    useEffect(() => {
            setEmployeeName('');
            setEmployeeValue('');
        
    },[props.isEditing])
    const handleSubmit = (e) => {
        e.preventDefault()
        props.submit(employeeName, employeeValue);
        setEmployeeName('');
        setEmployeeValue('');

    }
    
    const handleChange = (e) => {
        const value = e.replace(/[^a-zA-Z]/ig, '');
        setEmployeeName(value);
    };
    return (
        <div>

            <form onSubmit={handleSubmit}>
                <h2>Add New Employee</h2>
                <div>
                    <label>Employee Name:</label>
                    <input
                        type="text"
                        value={employeeName}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                </div>
                <div>
                    <label>Employee Value:</label>
                    <input
                        type="number"
                        value={employeeValue}
                        onChange={(e) => setEmployeeValue(e.target.value)}
                    />
                </div>
                <button type="submit">Add Employee</button>
            </form>

        </div>
    );
}

export const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(true);
    const [editableEmployee, setEditableEmployee] = useState(null);
    const [saveEmployee, setSaveEmployee] = useState(null);
    const [totalSum, setTotalSum] = useState([]);
    const [largeABC, setLargeABC] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [fetchInterval, setFetchInterval] = useState(null);
    const handleEdit = (employee) => {
        ;
        setEditableEmployee({ ...employee }); // Set the employee being edited
        setSaveEmployee({ ...employee });
        setIsEditMode(true);
    };

    const addEmployee = (name, value) => {

        if (!name || !value) {
            alert('Please provide both name and value.');
            return;
        }
        if (checkName(name)) {
            alert('Name Already Exists');
            return;
        }
        const addEmployees = [...employees, { name, value }].sort((a, b) => a.name.localeCompare(b.name));
        setEmployees(addEmployees);
        fetching('add', {
            name: name,
            value: parseInt(value)
        }, 'POST');
        if (isEditMode) {
            setIsEditMode(false);
            setEditableEmployee(null);
            setSaveEmployee(null);
        }

    };
    const fetching = async (action,employeeData,method) => {
        try {
            const response = await fetch('List/'+action, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });
            const actionName = action.includes('modify') ? 'modify' : action;
            if (response.ok) {
                
                alert('Employee ' + actionName + ' successfully!');
                
         
            } else {
                alert('Failed to ' + actionName +' employee. Please try again.');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
    const checkName = (name) => {
        return employees.find(e => e.name === name);
    }
    const handleChange = (e, field) => {
        const { value } = e.target;
        setSaveEmployee((prev) => ({
            ...prev,
            [field]: field === 'name' ? value.replace(/[^a-zA-Z]/ig, '') : value,
        }));
    };

    const handleSave = async (employee) => {

        if (!employee.name || !employee.value) {
            alert('Update Action: Please provide both name and value.');
            return;
        }
        if (employee.name != editableEmployee.name && checkName(employee.name)) {
            alert('Update Action: Name Already Exists');
            return;
        }
        setEmployees(employees => employees.map(e => e.name === editableEmployee.name ? { ...e, name: employee.name, value: employee.value } : e));

        
        fetching(`modify/${editableEmployee.name}`, {
            name: employee.name,
            value: parseInt(employee.value)
        }, 'PUT');
               
        setIsEditMode(false);
        setEditableEmployee(null);
        setSaveEmployee(null);


    };

    const handleDelete = async (employee) => {

        const employeeData = {
            name: employee.name,
            value: parseInt(employee.value)
        };

         fetching(`remove`, employeeData, 'DELETE');
         setIsEditMode(false);
    };


    const cancelInterval = () => {
        clearInterval(fetchInterval);
        setFetchInterval(null);

    }
    useEffect(() => {
        if (!isEditMode) {
            const interval = setInterval(() => {
                fetch('/Employees')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(employees => {
                        setEmployees(employees);
                        setLoading(false);
                    })
                    .catch(error => {
                        setError(error.message);
                        setLoading(false);
                    });
                fetch('/List/ListSum').then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                    .then(totalSum => {
                        setTotalSum(totalSum);


                    })
                    .catch(error => {
                        setError(error.message);
                    });

                fetch('/List/ListNameLarge').then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                    .then(largeABC => {
                        setLargeABC(largeABC);


                    })
                    .catch(error => {
                        setError(error.message);
                    });
                
                    fetch('/List/ListIncrement', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },

                    });
                


            }, 1000);

            setFetchInterval(interval);
        } else {
            cancelInterval();
        }

        return () => {
            cancelInterval();
        };

    }, [isEditMode]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    
    return (
        <>
            {isEditMode?(<p>Editing... </p>):(<></>)}
            <AddEmployee check={checkName} submit={addEmployee} isEditing={isEditMode} />
            <div className="panel">
                <div><table className='employee-table'>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Action</th>
                    </tr>
                    {employees?.map((employee) => (
                        <tr>
                            {editableEmployee?.name === employee.name ? (
                                <>
                                    <td>
                                        <input
                                            type="text"
                                            value={saveEmployee.name || ''}
                                            onChange={(e) => handleChange(e, 'name')}
                                            placeholder={employee.name} />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={saveEmployee.value || ''}
                                            onChange={(e) => handleChange(e, 'value')}
                                            placeholder={employee.value}
                                        />
                                    </td>
                                    <td><button onClick={() => handleSave(saveEmployee)}>Save</button>
                                        <button onClick={() => handleDelete(employee)}>Delete</button></td></>
                            ) : (
                                <><td>{employee.name}</td>
                                    <td>{employee.value}</td>
                                    <td><button onClick={() => handleEdit(employee)}>Edit</button></td></>

                            )}

                        </tr>

                    ))}
                </table></div>
                
                <div>{totalSum.length !== 0 ? (<table className='employee-table'>
                    <thead>
                        <tr>
                            <th>Summed Names begin With</th>
                            <th>Total Sum >= 11171</th>
                        </tr>

                    </thead>
                    {totalSum?.map(s => (
                        <tbody>
                            <tr>
                                <td>{s.name}</td>
                                <td>{s.value}</td>
                            </tr>
                        </tbody>

                    ))

                    }
                </table>) : (<table></table>)}
                    {largeABC ? (
                        <table className='employee-table'>
                            <tr>
                                <th>Name</th>
                                <th>Value >= 11171</th>
                            </tr>
                            {largeABC.map((em) => (
                                <tr>
                                    <td>{em.name}</td>
                                    <th>{em.value}</th>
                                </tr>
                            ))}
                        </table>

                    ) : (<></>)
                    }</div>
                
               

            </div>
        </>
    );
}
