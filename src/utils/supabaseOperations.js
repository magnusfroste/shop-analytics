import { supabase } from './supabaseClient';
import Papa from 'papaparse';

export const uploadCSV = async (file, maxRows) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: async (results) => {
        const validColumns = ['Id', 'id_camera', 'id_person', 'visit_date', 'leave_date', 'age', 'gender'];
        const dataToInsert = results.data.slice(0, maxRows).map(row => {
          const validRow = {};
          validColumns.forEach(column => {
            if (row[column] !== undefined && row[column] !== '') {
              validRow[column] = row[column];
            }
          });
          return validRow;
        });

        // Split the data into chunks of 1000 rows (Supabase limit)
        const chunkSize = 1000;
        for (let i = 0; i < dataToInsert.length; i += chunkSize) {
          const chunk = dataToInsert.slice(i, i + chunkSize);
          const { data, error } = await supabase
            .from('anavid_testdata')
            .insert(chunk);

          if (error) {
            console.error('Error inserting chunk:', error);
            reject(error);
            return;
          }
        }

        resolve({ message: `Uploaded ${dataToInsert.length} rows successfully` });
      },
      header: true,
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const deleteAllRows = async () => {
  const { data, error } = await supabase
    .from('anavid_testdata')
    .delete()
    .neq('Id', 0);

  if (error) {
    throw error;
  }
  return data;
};

export const getRowCount = async () => {
  const { count, error } = await supabase
    .from('anavid_testdata')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw error;
  }
  return count;
};
