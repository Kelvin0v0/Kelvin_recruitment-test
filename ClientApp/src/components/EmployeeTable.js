import React, { useState, useEffect } from 'react';
import './EmployeeTable.css';


function AddEmployee(props) {
    const [employeeName, setEmployeeName] = useState('');
    const [employeeValue, setEmployeeValue] = useState('');
   
    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!employeeName || !employeeValue) {
            alert('Please provide both name and value.');
            return;
        }
        if (props.check(employeeName)) {
            alert('Name Already Exists');
            return;
        }

  
        
        const employeeData = {
            name: employeeName,
            value: parseInt(employeeValue)
        };

        try {
            const response = await fetch('List/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (response.ok) {
               
                alert('Employee added successfully!');
                // Reset form
                setEmployeeName('');
                setEmployeeValue('');
                
            } else {
                alert('Failed to add employee. Please try again.');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };
    const handleChange = (e) => {
        const value = e.replace(/[^a-zA-Z]/ig, '');
        // Use regex to allow only alphabetic characters

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
    const [isEditMode, setIsEditMode] = useState(false);
    const [fetchInterval, setFetchInterval] = useState(null);
    const handleEdit = (employee) => {;
        setEditableEmployee({ ...employee }); // Set the employee being edited
        setSaveEmployee({ ...employee });
        setIsEditMode(true);
    };

    const checkName = (name) => {
        return employees.find(e => e.name === name);
    }
    const handleChange = (e, field) => {
        const { value } = e.target;
       

        setSaveEmployee((prev) => ({
            ...prev,
            [field]: field==='name'?value.replace(/[^a-zA-Z]/ig,''):value,
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
        setEmployees(employees => employees.map(e => e.name === editableEmployee.name ?{ ...e, name: employee.name, value: employee.value } :e ));
       
        const employeeData = {
            name: employee.name,
            value: parseInt(employee.value)
        };
        try { 

            
            const response = await fetch(`List/modify/${editableEmployee.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (response.ok) {
                
                alert('Employee updated successfully!');
    
            } else {
                alert('Failed to updated employee. Please try again.');
            }
            setIsEditMode(false);
        } catch (error) {
            alert('Error: ' + error.message);
        }
        setEditableEmployee(null);
        setSaveEmployee(null);
        

    };

    const handleDelete = async (employee) => {
        setIsEditMode(true);
       
        const employeeData = {
            name: employee.name,
            value: parseInt(employee.value)
        };
        try {
            
            const response = await fetch(`List/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (response.ok) {
                setEmployees(employees.filter(em =>
                    em.name !== employee.name
                ));
                
                alert('Employee deleted successfully!');
                // Reset form
            } else {
                alert('Failed to deleted employee. Please try again.');
            }
            setIsEditMode(false);
        } catch (error) {
            alert('Error: ' + error.message);
        }
        
        
    };
   

    const fetchData = (time) => {
       
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

            fetch('/List/ListIncrement', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },

            });;
        }, time);
       
        setFetchInterval(interval);
         
    }
    const cancelInterval = () => {
        clearInterval(fetchInterval);
        setFetchInterval(null);
        
    }
    useEffect(() => {
        if (!isEditMode) {
            fetchData(1000);
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
            <AddEmployee check={checkName} />
            <div className="panel">
                <table className='employee-table'>
                    <thead>
                        <tr>
                            <th>Summed Names begin With</th>
                            <th>Total Sum >= 11171</th>
                        </tr>

                    </thead>
                    {totalSum?.map( s => (
                       
                            
                             <tbody>
                            <tr>
                                <td>{s.name}</td>
                                <td>{s.value}</td>
                            </tr>
                        </tbody>

                    ) )

                    }
                </table>
                <table className='employee-table'>
            <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Action</th>
            </tr>
            {employees?.map((employee) => (
                <tr>

                    <td>
                        { 
                            editableEmployee?.name === employee.name ? (
                            <input
                                type="text"
                                value={saveEmployee.name || ''}
                                onChange={(e) => handleChange(e, 'name')}
                                placeholder={employee.name}
                            />
                        ) : (
                            employee.name
                        )}
                    </td>

                    {/* Editable Value */}
                    <td>
                        {editableEmployee?.name === employee.name ? (
                            <input
                                type="number"
                                value={saveEmployee.value || ''}
                                onChange={(e) => handleChange(e, 'value')}
                                placeholder={employee.value}
                            />
                        ) : (
                            employee.value
                        )}
                    </td>
                    <td>
                        {editableEmployee?.name === employee.name ? (
                            <button onClick={() => handleSave(saveEmployee)}>Save</button>
                        ) : (
                            <button onClick={() => handleEdit(employee)}>Edit</button>
                        )}
                        <button onClick={() => handleDelete(employee)}>Delete</button>
                    </td>
                    </tr>

            ))}
                </table>
               
            
            </div>
        </>
    );
}
