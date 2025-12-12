import { addTask, markDone, listTasks } from './storage/index.js';

async function main() {
  console.log('🧠 Daily Intent Engine - Task Storage Test\n');

  try {
    // Add some test tasks
    console.log('📝 Adding tasks...');
    const task1 = await addTask('Write unit tests', 'medium');
    console.log(`  ✓ Added: "${task1.text}" (ID: ${task1.id.substring(0, 8)}...)`);

    const task2 = await addTask('Review PR', 'low');
    console.log(`  ✓ Added: "${task2.text}" (ID: ${task2.id.substring(0, 8)}...)`);

    const task3 = await addTask('Deploy to production', 'high');
    console.log(`  ✓ Added: "${task3.text}" (ID: ${task3.id.substring(0, 8)}...)\n`);

    // List all tasks
    console.log('📋 Listing all tasks:');
    let tasks = await listTasks();
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. [${task.status}] ${task.text} (${task.energy} energy)`);
    });
    console.log();

    // Mark first task as done
    console.log('✅ Marking task as done...');
    const completed = await markDone(task1.id);
    if (completed) {
      console.log(`  ✓ Completed: "${completed.text}"`);
      console.log(`  ✓ Completion time: ${completed.completedAt}\n`);
    }

    // List tasks again
    console.log('📋 Updated task list:');
    tasks = await listTasks();
    tasks.forEach((task, index) => {
      const statusIcon = task.status === 'done' ? '✓' : ' ';
      console.log(`  ${index + 1}. [${statusIcon}] ${task.text} (${task.energy} energy)`);
    });
    console.log();

    // Show task history
    console.log('📜 Task history for completed task:');
    const completedTask = tasks.find(t => t.id === task1.id);
    if (completedTask) {
      completedTask.history.forEach((entry, index) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        console.log(`  ${index + 1}. ${entry.action} at ${time}`);
      });
    }

    console.log('\n✨ Task storage system working correctly!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
