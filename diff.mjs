import fs from 'fs';
import fetch from 'node-fetch';

async function processLevels() {
  try {
    // Clear the file by writing an empty array
    await fs.promises.writeFile('diff.json', '[]');
    console.log('File is cleared!');

    // Fetch the levels from the API
    const response = await fetch('https://api.slin.dev/grab/v1/list?max_format_version=100&type=ok');
    const levels = await response.json();

    // Filter the levels to find the ones with 0 difficulty and no plays
    const unplayedLevels = levels.filter(level => level.statistics.difficulty === 0)
                                 .filter(level => level.statistics.total_played_count === 0);

    // Process the unplayed levels and write them to the file
    const data = await Promise.all(unplayedLevels.map(async level => {
      const id = level.identifier.replace(':', '/');
      const statsResponse = await fetch(`https://api.slin.dev/grab/v1/statistics/${id}`);
      const stats = await statsResponse.json();
      const timestampInMilliseconds = level.creation_timestamp;
      const timeElapsedInSeconds = Math.floor((Date.now() - timestampInMilliseconds) / 1000);
      const timeElapsedInMinutes = Math.floor(timeElapsedInSeconds / 60);
      const timeElapsedInHours = Math.floor(timeElapsedInMinutes / 60);
      const timeElapsedInDays = Math.floor(timeElapsedInHours / 24);
      const time = timeElapsedInDays > 0
        ? `${timeElapsedInDays} days`
        : timeElapsedInHours > 0
          ? `${timeElapsedInHours} hours`
          : timeElapsedInMinutes > 0
            ? `${timeElapsedInMinutes} minutes`
            : `${timeElapsedInSeconds} seconds`;
      return {
        title: level.title,
        plays: stats.total_played_count,
        link: `https://grabvr.quest/levels/viewer?level=${level.identifier}`,
        age: time,
      };
    }));
    await fs.promises.writeFile('diff.json', JSON.stringify(data));
    console.log('Data written to file!');
  } catch (error) {
    console.error(error);
  }
}

processLevels();
