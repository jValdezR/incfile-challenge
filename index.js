const { default: puppeteer } = require('puppeteer');

require('dotenv').config();

const getTasksFromTrello = async () => {
    const browser = await puppeteer.launch(
        {
            headless: false,
        }
    );

    const page = await browser.newPage();

    try {
        await page.goto('https://trello.com/b/QvHVksDa/personal-work-goals');
        await page.waitForSelector('.oVcaxVSv1L1Ynk.bxgKMAm3lq5BpA.SdamsUKjxSBwGb.SEj5vUdI3VvxDc', {
            visible: true,
            timeout: 10000
        });
        await page.click('.oVcaxVSv1L1Ynk.bxgKMAm3lq5BpA.SdamsUKjxSBwGb.SEj5vUdI3VvxDc');

        const tasksElement = await page.evaluate(() => {
            const elements = document.querySelectorAll('.list-card.js-member-droppable.ui-droppable');
            return [...elements].map(element => {
                const title = element.querySelector('.list-card-title.js-card-name').innerText;
                const url = element.href;
                const href = url.substring(18, url.lenght)
                return {
                    href,
                    title
                }
            })
        });
        console.log(tasksElement);
        for (let i = 0; i < tasksElement.length; i++) {
            await page.click(`a[href="${tasksElement[i].href}"]`);
            try {
                await page.waitForSelector('.checklist-item-details-text.markeddown.js-checkitem-name', {
                    visible: true,
                    timeout: 300
                });
            } catch (error) {

            }

            const taskObject = await page.evaluate(() => {
                const list = document.querySelector('.disabled').innerText;
                const description = document.querySelector('.Wmhs_I85q7GFo5 a') ? document.querySelector('.Wmhs_I85q7GFo5 a').innerText : "";
                const subTasksElement = document.querySelectorAll('.checklist-item-details-text.markeddown.js-checkitem-name');
                const subTasks = [...subTasksElement].map(subTask => subTask.innerText);

                return {
                    list,
                    description,
                    subTasks
                }

            })

            taskArray.push({
                title: tasksElement[i].title,
                ...taskObject
            });

            await page.click('.icon-md.icon-close.dialog-close-button.js-close-window');
        }

        return taskArray;

    } catch (error) {
        console.log(error);
    }
    await browser.close();
}

async function createTasksOnToDoIst(taskArray) {
    const browser = await puppeteer.launch(
        {
            headless: false,
        }
    );
    const page = await browser.newPage();

    try {
        await page.goto('https://todoist.com/auth/login');

        await page.waitForSelector('input[type="email"]');

        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');

        await emailInput.type(process.env.TODOIST_MAIL);
        await passwordInput.type(process.env.TODOIST_PASSWORD);

        await Promise.all([
            page.waitForNavigation(),
            page.click('.F9gvIPl.rWfXb_e._8313bd46._7a4dbd5f._95951888._2a3b75a1._8c75067a'),
        ]);


        await page.waitForSelector('.plus_add_button', {
            visible: true,
            timeout: 10000
        });

        await page.click('.plus_add_button');

        page.waitForSelector('.UjpFDa7.no-focus-marker.task_editor__content_field--semibold div p.is-empty.is-editor-empty',{
            visible: true,
            timeout: 1000
        });

        const titleElement = await page.$('.UjpFDa7.no-focus-marker.task_editor__content_field--semibold div p.is-empty.is-editor-empty');
        const descriptionTask = await page.$('.UjpFDa7.task_editor__description_field.no-focus-marker div p.is-empty.is-editor-empty');

        for (let i = 0; i < 5; i++) {
            await titleElement.type(taskArray[i].title);
            await new Promise(r=>setTimeout(r,200));
            await descriptionTask.type(taskArray[i].description);
            await new Promise(r=>setTimeout(r,200));
            const createTaskButton = await page.$('._8313bd46._7a4dbd5f._5e45d59f._2a3b75a1._56a651f6');
            await createTaskButton.click();
            await page.waitForSelector('._8313bd46._7a4dbd5f._5e45d59f._2a3b75a1._56a651f6', {
                visible: true,
                timeout: 1000
            })
        }

        await page.click('._8313bd46._54d56775._5e45d59f._2a3b75a1._56a651f6');




        for (let i = 0; i < 5; i++) {
            const elements = await page.$$('.task_content');
            const elementsArray = [...elements];
            await elementsArray[i].click();
            await page.waitForSelector('._8313bd46.f169a390._8b7f1a82._2a3b75a1._56a651f6', {
                visible: true,
                timeout: 1000
            });

            await page.click('._8313bd46.f169a390._8b7f1a82._2a3b75a1._56a651f6');

            for (let j = 0; j < taskArray[i].subTasks.length; j++) {
                await titleElement.type(taskArray[i].subTasks[j]);
                const createTaskButton = await page.$('._8313bd46._7a4dbd5f._5e45d59f._2a3b75a1._56a651f6');
                await createTaskButton.click();
            }
            await page.click('._8313bd46._54d56775._5e45d59f._2a3b75a1._56a651f6');
            await page.click('button[aria-label="Cerrar ventana"]');

        }

    } catch (error) {
        console.log(error);
    }
}

const main = async () => {
    // const taskArray = await getTasksFromTrello();
    // createTasksOnToDoIst(taskArray);

    // console.log(await getTasksFromTrello());

    await createTasksOnToDoIst([
        {
            title: 'Cook new recipes on the weekend',
            list: 'Personal',
            description: '',
            subTasks: [
                "Ramsay's Leek & Mushroom Pasta:thumbsup:",
                'Smashed Potatoes',
                'Spaghetti with Italian Sausage and Mushroom:smile:'
            ]
        },
        {
            title: 'Research freelance possibilites',
            list: 'Personal',
            description: '',
            subTasks: []
        },
        {
            title: 'Land first freelance job',
            list: 'Personal',
            description: '',
            subTasks: []
        },
        {
            title: 'Compile list of favorite photos for photo book gift at Christmas',
            list: 'Personal',
            description: '',
            subTasks: []
        },
        {
            title: 'Complete software update 4.1 before September',
            list: 'Work',
            description: '',
            subTasks: [
                'Verify the GetData function works with new form',
                'Test the other forms to make sure they still work with the updated data',
                "Fix error that occurs when user clicks the add data button and then today's date"
            ]
        },

    ]);
}

main();