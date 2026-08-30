import sqlite3
import json
import uuid

db_path = r"C:\Users\Eng SAMATAR\Desktop\SILT\SILT1\DugsiAI\prisma\dev.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # 1. Create Grade 8 subjects if they don't exist
    subjects_to_seed = [
        ('8-biology', 'Biology', 8),
        ('8-mathematics', 'Mathematics', 8)
    ]
    for sid, name, grade in subjects_to_seed:
        cursor.execute("INSERT OR IGNORE INTO Subject (id, name, grade) VALUES (?, ?, ?)", (sid, name, grade))
        
    # 2. Create chapters for Grade 8 subjects
    chapters_to_seed = [
        ('8-biol-ch1', 'Unit 1: Introduction to Cell Biology', 1, '8-biology'),
        ('8-math-ch1', 'Unit 1: Rational Numbers and Equations', 1, '8-mathematics')
    ]
    for cid, name, num, sid in chapters_to_seed:
        cursor.execute("INSERT OR IGNORE INTO Chapter (id, name, chapterNumber, subjectId) VALUES (?, ?, ?, ?)", (cid, name, num, sid))

    # 3. Seed some Grade 8 questions
    questions_to_seed = [
        # Biology Grade 8 Questions
        (str(uuid.uuid4()), 'MCQ', 'Which organelle is known as the powerhouse of the cell?', json.dumps(['Nucleus', 'Mitochondria', 'Chloroplast', 'Ribosome']), 'Mitochondria', 'Mitochondria generates chemical energy (ATP) for cellular processes.', 'EASY', '8-biol-ch1'),
        (str(uuid.uuid4()), 'MCQ', 'What is the main function of chloroplasts in plant cells?', json.dumps(['Protein synthesis', 'Cellular respiration', 'Photosynthesis', 'Waste storage']), 'Photosynthesis', 'Chloroplasts capture light energy to produce sugars via photosynthesis.', 'EASY', '8-biol-ch1'),
        # Mathematics Grade 8 Questions
        (str(uuid.uuid4()), 'MCQ', 'What is the value of x if 2x + 5 = 15?', json.dumps(['x = 5', 'x = 10', 'x = 2', 'x = 4']), 'x = 5', 'Subtract 5: 2x = 10, divide by 2: x = 5.', 'EASY', '8-math-ch1'),
        (str(uuid.uuid4()), 'MCQ', 'Which of the following is a rational number?', json.dumps(['pi', 'square root of 2', '3/4', 'square root of -1']), '3/4', 'A rational number can be written as a fraction of two integers.', 'EASY', '8-math-ch1')
    ]
    for qid, qtype, text, opts, ans, expl, diff, cid in questions_to_seed:
        cursor.execute("""
            INSERT OR IGNORE INTO Question (id, type, text, options, correctAnswer, explanation, difficulty, chapterId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (qid, qtype, text, opts, ans, expl, diff, cid))

    # Commit so we can retrieve question IDs
    conn.commit()

    # 4. Generate MockExam entries with question collections
    exams_data = [
        # Grade 8 Subject -> Year
        ('g8-bio-2017', 'Grade 8 Biology National Exam (2017 EC)', 8, '8-biology'),
        ('g8-bio-2018', 'Grade 8 Biology National Exam (2018 EC)', 8, '8-biology'),
        ('g8-math-2017', 'Grade 8 Mathematics National Exam (2017 EC)', 8, '8-mathematics'),
        # ESSLCE / EUEEE Year -> Subject
        ('esslce-2025-phys', 'ESSLCE 2025 Physics Exam', 12, '12-physics'),
        ('esslce-2024-chem', 'ESSLCE 2024 Chemistry Exam', 12, '12-chemistry'),
        ('eueee-2025-math', 'EUEEE 2025 Mathematics Exam', 12, '12-mathematics'),
        ('esslce-2018-econ', 'ESSLCE 2018 Economics Exam', 12, '12-economics'),
        ('eueee-2018-geog', 'EUEEE 2018 Geography Exam', 12, '12-geography')
    ]

    for eid, title, grade, sid in exams_data:
        # Get up to 50 question IDs for the subject
        cursor.execute("""
            SELECT q.id FROM Question q
            JOIN Chapter c ON q.chapterId = c.id
            WHERE c.subjectId = ?
        """, (sid,))
        q_ids = [row[0] for row in cursor.fetchall()]
        
        # If no questions found (e.g. for some Grade 12 subjects that might be empty), fallback
        if not q_ids:
            # Check if there are generic questions, otherwise seed dummy ones
            q_ids = ['dummy-q-1', 'dummy-q-2']

        questions_list_json = json.dumps(q_ids[:50])

        cursor.execute("""
            INSERT OR REPLACE INTO MockExam (id, title, grade, subjectId, durationMinutes, questionsList)
            VALUES (?, ?, ?, ?, 90, ?)
        """, (eid, title, grade, sid, questions_list_json))

    conn.commit()
    print("Successfully seeded all mock exams and questions!")

except Exception as e:
    print("Error seeding database:", e)
    conn.rollback()
finally:
    conn.close()
