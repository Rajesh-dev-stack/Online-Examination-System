import * as XLSX from 'xlsx';

export function parseExcelQuestions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        // Expected Excel columns: Question | Option A | Option B | Option C | Option D | Answer | Marks
        const questions = rows.map(row => ({
          questionText: row['Question'],
          optionA: row['Option A'] || '',
          optionB: row['Option B'] || '',
          optionC: row['Option C'] || '',
          optionD: row['Option D'] || '',
          correctAnswer: row['Answer'],
          marks: parseInt(row['Marks']) || 1,
          source: 'excel'
        }));
        
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

// Generate Excel template for teachers
export function downloadExcelTemplate() {
  const template = [{
    'Question': 'Sample question here?',
    'Option A': 'First option',
    'Option B': 'Second option',
    'Option C': 'Third option',
    'Option D': 'Fourth option',
    'Answer': 'A',
    'Marks': 1
  }];
  
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  XLSX.writeFile(wb, 'question_template.xlsx');
}
