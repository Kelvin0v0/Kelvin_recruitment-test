using InterviewTest.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Xml.Linq;

namespace InterviewTest.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ListController : ControllerBase
    {
        public ListController()
        {
        }

        /*
         * List API methods goe here
         * */
        [HttpPost]
        [Route("add")]
        public IActionResult addEmployee(Employee newEmployee)
        {

            var employee = new Employee();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = "SELECT Name, Value FROM Employees WHERE Name = @Name AND Value = @Value";
                queryCmd.Parameters.AddWithValue("@Name", newEmployee.Name);
                queryCmd.Parameters.AddWithValue("@Value", newEmployee.Value);
                bool employeeFound = false;
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        employee.Name = reader.GetString(0);
                        employee.Value = reader.GetInt32(1);
                        employeeFound = true;

                    }
                }
                if (!employeeFound)
                {
                    var insertCmd = connection.CreateCommand();
                    insertCmd.CommandText = "INSERT INTO Employees (Name, Value) VALUES (@Name, @Value)";
                    insertCmd.Parameters.AddWithValue("@Name", newEmployee.Name);
                    insertCmd.Parameters.AddWithValue("@Value", newEmployee.Value);

                    int rowsAffected = insertCmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        return Ok(employee);
                    }
                    else
                    {
                        return StatusCode(500, "Internal server error: Insert Error");
                       
                    }
                }
                else
                {
                    return NotFound();
                }



            }

        }

        [HttpPut]
        [Route("modify/{name}")]
        public IActionResult modifyEmployee(string name, Employee changedEmployee)
        {

            var employee = new Employee();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = "SELECT Name, Value FROM Employees WHERE Name = @Name";
                queryCmd.Parameters.AddWithValue("@Name", name);
                bool employeeFound = false;
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        employee.Name = reader.GetString(0);
                        employee.Value = reader.GetInt32(1);
                        employeeFound = true;

                    }
                }
                if (employeeFound)
                {
                    var insertCmd = connection.CreateCommand();
                    insertCmd.CommandText = "UPDATE Employees SET Name=@Name, Value=@Value WHERE Name=@Old_Name";
                    insertCmd.Parameters.AddWithValue("@Name", changedEmployee.Name);
                    insertCmd.Parameters.AddWithValue("@Value", changedEmployee.Value);

                    insertCmd.Parameters.AddWithValue("@Old_Name", name);

                    int rowsAffected = insertCmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        return NoContent();
                    }
                    else
                    {

                        return StatusCode(500, "Internal server error: Update Error");
                    }
                }
                else
                {
                    return NotFound();
                }
            }
        }
        [HttpDelete]
        [Route("remove")]
        public IActionResult removeEmployee(Employee rmEmployee)
        {

            var employee = new Employee();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = "SELECT Name, Value FROM Employees WHERE Name = @Name";
                queryCmd.Parameters.AddWithValue("@Name", rmEmployee.Name);
           
                bool employeeFound = false;
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        employee.Name = reader.GetString(0);
                        employee.Value = reader.GetInt32(1);
                        employeeFound = true;

                    }
                }
                if (employeeFound)
                {
                    var insertCmd = connection.CreateCommand();
                    insertCmd.CommandText = "DELETE FROM Employees WHERE Name=@Name AND Value = @Value";
                    insertCmd.Parameters.AddWithValue("@Name", employee.Name);
                    insertCmd.Parameters.AddWithValue("@Value", employee.Value);


                    int rowsAffected = insertCmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        return NoContent();
                    }
                    else
                    {
                        return StatusCode(500, "Internal server error: Insert Error");
                    }
                }
                else
                {
                    return NotFound();
                }
            }
        }


        [HttpPut]
        [Route("ListIncrement")]
        public void ListIncrement()
        {
            var employees = new List<Employee>();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    var updateCmd = connection.CreateCommand();
                    updateCmd.CommandText = @"UPDATE Employees SET Value = 
                    CASE
                        WHEN Name LIKE 'E%' THEN Value + 1
                        WHEN Name LIKE 'G%' THEN Value + 10
                        ELSE Value + 100
                    END";


                    updateCmd.ExecuteNonQuery();
                    transaction.Commit();
                }
            }

        }

        [HttpGet]
        [Route("ListSum")]
        public List<Employee> ListSum()
        {
            List<Employee> totalSumABC = new List<Employee>() ;

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();
                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"SELECT SUBSTR(name, 1, 1) AS Inital, SUM(Value) AS TotalValue FROM Employees WHERE SUBSTR(name, 1, 1) IN ('A', 'B', 'C') GROUP BY Inital HAVING SUM(Value) >= 11171";
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        totalSumABC.Add(new Employee
                        {
                            Name = reader.GetString(0),
                            Value = reader.GetInt32(1)
                        });

                    }
                }
            }
            return totalSumABC;

        }
     

    }
}
