let workLogs = JSON.parse(localStorage.getItem("workLogs")) || {};
let currentViewDate = new Date();
let selectedDateStr = "";

function renderCalendar() {
	const grid = document.getElementById("calendar-grid");
	const monthLabel = document.getElementById("current-month-year");
	if (!grid || !monthLabel) return;

	grid.innerHTML = "";
	const year = currentViewDate.getFullYear();
	const month = currentViewDate.getMonth();

	monthLabel.innerText = new Intl.DateTimeFormat("uk-UA", {
		month: "long",
		year: "numeric",
	}).format(currentViewDate);

	let firstDay = new Date(year, month, 1).getDay();
	firstDay = firstDay === 0 ? 6 : firstDay - 1;
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const prevMonthLastDay = new Date(year, month, 0).getDate();

	// Сусідній місяць (минулий)
	for (let i = firstDay; i > 0; i--) {
		const day = prevMonthLastDay - i + 1;
		grid.innerHTML += `<div class="calendar-day neighbor-month">${day}</div>`;
	}

	// Поточний місяць
	for (let day = 1; day <= daysInMonth; day++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const data = workLogs[dateStr];
		const isToday = new Date().toISOString().split("T")[0] === dateStr;

		let marks = "";
		if (data && data.shift !== -1) {
			if (data.shift > 0) {
				// Кольорова мітка для робочої зміни
				marks = `<div class="day-mark mark-${data.shift}"></div>`;
			} else if (data.shift === 0) {
				// Мітка для вихідного
				marks = `<div class="day-mark mark-off"></div>`;
			}
		}

		grid.innerHTML += `
            <div class="calendar-day ${isToday ? "today" : ""} ${data && data.shift !== -1 ? "has-data" : ""}" onclick="openEditor('${dateStr}')">
                ${day} ${marks}
            </div>`;
	}

	// Сусідній місяць (наступний)
	const totalSlots = firstDay + daysInMonth;
	const nextMonthDays = (7 - (totalSlots % 7)) % 7;
	for (let day = 1; day <= nextMonthDays; day++) {
		grid.innerHTML += `<div class="calendar-day neighbor-month">${day}</div>`;
	}

	updateStats();
}

function updateStats() {
	let shifts = 0,
		otTotal = 0,
		hoursTotal = 0;
	const year = currentViewDate.getFullYear();
	const month = currentViewDate.getMonth();

	for (let date in workLogs) {
		const [y, m] = date.split("-").map(Number);
		if (y === year && m === month + 1) {
			const entry = workLogs[date];
			if (entry.shift > 0) {
				shifts++;
				hoursTotal += 8;
			}
			const ot = parseFloat(entry.overtime || 0);
			otTotal += ot;
			hoursTotal += ot;
		}
	}

	document.getElementById("stat-shifts").innerText = shifts;
	document.getElementById("stat-overtime").innerText = otTotal;
	document.getElementById("stat-total").innerText = hoursTotal;
}

function openEditor(dateStr) {
	selectedDateStr = dateStr;
	const data = workLogs[dateStr] || { shift: 0, overtime: 0 };

	document.getElementById("modal-date").innerText = new Date(
		dateStr,
	).toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
	document.getElementById("input-shift").value = data.shift;
	document.getElementById("input-overtime").value = data.overtime || "";

	updateShiftOptions(dateStr);
	toggleOvertimeVisibility();
	document.getElementById("edit-modal").classList.add("active");
}

function updateShiftOptions(dateStr) {
	const date = new Date(dateStr);
	const dayOfWeek = date.getDay(); // 0 = воскресенье, 5 = суббота, 6 = воскресенье
	const selectElement = document.getElementById("input-shift");
	const unavailableOption = selectElement.querySelector('option[value="-1"]');
	const offDayOption = selectElement.querySelector('option[value="0"]');

	// Суббота (5) и воскресенье (0, 6) - скрываем "Не відпрацьовано", показываем только "Вихідний"
	if (dayOfWeek === 5 || dayOfWeek === 0 || dayOfWeek === 6) {
		unavailableOption.style.display = "none";
		offDayOption.style.display = "block";
	} else {
		unavailableOption.style.display = "block";
		offDayOption.style.display = "block";
	}
}

function toggleOvertimeVisibility() {
	const shift = document.getElementById("input-shift").value;
	const otGroup = document.getElementById("overtime-group");
	if (shift == "0" || shift == "-1") {
		document.getElementById("input-overtime").value = "";
		otGroup.style.opacity = "0.3";
		otGroup.style.pointerEvents = "none";
	} else {
		otGroup.style.opacity = "1";
		otGroup.style.pointerEvents = "auto";
	}
}

function setOT(val) {
	document.getElementById("input-overtime").value = val;
}

function saveData() {
	const shift = parseInt(document.getElementById("input-shift").value);
	let overtime =
		parseFloat(document.getElementById("input-overtime").value) || 0;

	// Якщо вихідний або не відпрацьовано - надгодини ігноруються
	if (shift === 0 || shift === -1) overtime = 0;

	// Валідація ліміту 6 годин
	if (overtime > 6) {
		alert("Максимально дозволено 6 надгодин!");
		document.getElementById("input-overtime").value = 6;
		return;
	}

	// Якщо день не відпрацьовано - видаляємо запис (день ще не настав)
	if (shift === -1) {
		delete workLogs[selectedDateStr];
	} else {
		// Для суботи та неділі - якщо вибран вихідний, просто видаляємо запис
		const date = new Date(selectedDateStr);
		const dayOfWeek = date.getDay();
		if ((dayOfWeek === 5 || dayOfWeek === 6) && shift === 0) {
			delete workLogs[selectedDateStr];
		} else {
			// Зберігаємо дані для робочих днів і вихідних в інші дні
			workLogs[selectedDateStr] = {
				shift,
				overtime,
				// Додаємо total для зручності розрахунків
				total: (shift > 0 ? 8 : 0) + overtime,
			};
		}
	}

	localStorage.setItem("workLogs", JSON.stringify(workLogs));
	closeModal();
	renderCalendar();
}

function closeModal() {
	document.getElementById("edit-modal").classList.remove("active");
}

function changeMonth(diff) {
	currentViewDate.setMonth(currentViewDate.getMonth() + diff);
	renderCalendar();
}

function openToday() {
	openEditor(new Date().toISOString().split("T")[0]);
}

function toggleMenu() {
	const menu = document.getElementById("export-menu");
	menu.classList.toggle("active");
}

function openSubmenu(menuId) {
	const mainMenu = document.getElementById("main-menu");
	const reportMenu = document.getElementById("report-menu");

	if (menuId === "main-menu") {
		mainMenu.style.display = "flex";
		reportMenu.style.display = "none";
	} else if (menuId === "report-menu") {
		mainMenu.style.display = "none";
		reportMenu.style.display = "flex";
	}
}

function generateMonthReport() {
	const year = currentViewDate.getFullYear();
	const month = currentViewDate.getMonth();

	const monthName = new Intl.DateTimeFormat("uk-UA", {
		month: "long",
		year: "numeric",
	}).format(currentViewDate);

	let shifts = 0;
	let otTotal = 0;
	let hoursTotal = 0;
	let details = [];

	for (let date in workLogs) {
		const [y, m] = date.split("-").map(Number);
		if (y === year && m === month + 1) {
			const entry = workLogs[date];
			const dateObj = new Date(date);
			const dayName = new Intl.DateTimeFormat("uk-UA", {
				weekday: "short",
				day: "numeric",
				month: "short",
			}).format(dateObj);

			let shiftName = "";
			if (entry.shift === 1) shiftName = "🌅 1 зміна (06:00 - 14:00)";
			else if (entry.shift === 2) shiftName = "🌆 2 зміна (14:00 - 22:00)";
			else if (entry.shift === 0) shiftName = "🏖️ Вихідний";

			if (entry.shift > 0) {
				shifts++;
				hoursTotal += 8;
				let detailText = `${dayName} - ${shiftName}`;
				if (entry.overtime > 0) {
					detailText += ` + ${entry.overtime}ч надгодин`;
					otTotal += entry.overtime;
					hoursTotal += entry.overtime;
				}
				details.push(detailText);
			} else if (entry.shift === 0) {
				details.push(`${dayName} - ${shiftName}`);
			}
		}
	}

	let report = `📊 Звіт за ${monthName}\n`;
	report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
	report += `✅ Змін відпрацьовано: ${shifts}\n`;
	report += `⏱️ Надгодини: ${otTotal} годин\n`;
	report += `📈 Всього годин: ${hoursTotal}\n\n`;

	if (hoursTotal === 0) {
		report += `А ти в цьому місяці не працював... 🤔\n`;
		report += `Вільне життя - це гарно! 😎`;
	} else {
		report += `📋 Детально:\n`;
		report += `━━━━━━━━━━━━━━━━━━━━━━\n`;
		report += details.join("\n");
	}

	return report;
}

function downloadReport() {
	const report = generateMonthReport();
	const monthName = currentViewDate.toLocaleString("uk-UA", {
		month: "long",
		year: "numeric",
	});
	const fileName = `worklog_${monthName}.txt`;

	const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);

	toggleMenu();
}

function shareReport() {
	const report = generateMonthReport();

	if (navigator.share) {
		navigator
			.share({
				title: "WorkLog звіт",
				text: report,
			})
			.catch((err) => console.log("Share error:", err));
	} else {
		alert("Ваш браузер не підтримує Share API");
	}

	toggleMenu();
}

function exportToTelegram() {
	const report = generateMonthReport();
	const telegramUrl = `https://t.me/share/url?url=${window.location.origin}&text=${encodeURIComponent("📊 WorkLog звіт\n\n" + report)}`;
	window.open(telegramUrl, "_blank");
	toggleMenu();
}

function generateYearReport() {
	const year = currentViewDate.getFullYear();
	const yearStr = year.toString();

	let totalShifts = 0;
	let totalOT = 0;
	let totalHours = 0;
	let monthlyData = {};

	// Инициализируем все месяцы
	for (let m = 1; m <= 12; m++) {
		monthlyData[m] = { shifts: 0, ot: 0, hours: 0 };
	}

	// Собираем данные по месяцам
	for (let date in workLogs) {
		const [y, m] = date.split("-").map(Number);
		if (y === year) {
			const entry = workLogs[date];
			if (entry.shift > 0) {
				monthlyData[m].shifts++;
				monthlyData[m].hours += 8;
				totalShifts++;
				totalHours += 8;
			}
			const ot = parseFloat(entry.overtime || 0);
			monthlyData[m].ot += ot;
			monthlyData[m].hours += ot;
			totalOT += ot;
			totalHours += ot;
		}
	}

	const monthNames = [
		"Січень",
		"Лютий",
		"Березень",
		"Квітень",
		"Травень",
		"Червень",
		"Липень",
		"Серпень",
		"Вересень",
		"Жовтень",
		"Листопад",
		"Грудень",
	];

	let report = `📊 Рік: ${yearStr}\n`;
	report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
	report += `📈 ВСЬОГО ЗА РІК:\n`;
	report += `✅ Змін: ${totalShifts}\n`;
	report += `⏱️ Надгодин: ${totalOT} годин\n`;
	report += `📊 Всього годин: ${totalHours}\n\n`;

	if (totalHours === 0) {
		report += `А ти в цьому році не працював... 🤔\n`;
		report += `Вільне життя - це гарно! 😎`;
	} else {
		report += `📋 ПО МІСЯЦЯМ:\n`;
		report += `━━━━━━━━━━━━━━━━━━━━━━\n`;

		for (let m = 1; m <= 12; m++) {
			const data = monthlyData[m];
			if (data.shifts > 0 || data.ot > 0) {
				report += `${monthNames[m - 1].padEnd(12)} | Змін: ${data.shifts.toString().padEnd(2)} | Год: ${data.hours.toString().padEnd(3)} `;
				if (data.ot > 0) report += `(+${data.ot}ч)`;
				report += `\n`;
			}
		}
	}

	return report;
}

function downloadYearReport() {
	const report = generateYearReport();
	const year = currentViewDate.getFullYear();
	const fileName = `worklog_${year}.txt`;

	const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);

	toggleMenu();
}

function shareYearReport() {
	const report = generateYearReport();

	if (navigator.share) {
		navigator
			.share({
				title: "WorkLog звіт за рік",
				text: report,
			})
			.catch((err) => console.log("Share error:", err));
	} else {
		alert("Ваш браузер не підтримує Share API");
	}

	toggleMenu();
}

function exportYearToTelegram() {
	const report = generateYearReport();
	const telegramUrl = `https://t.me/share/url?url=${window.location.origin}&text=${encodeURIComponent("📊 WorkLog звіт за рік\n\n" + report)}`;
	window.open(telegramUrl, "_blank");
	toggleMenu();
}

function clearAllData() {
	const confirmed = confirm(
		"⚠️ Ви впевнені?\n\nЦя дія видалить ВСІ дані про роботу. Цю дію неможливо скасувати!",
	);

	if (confirmed) {
		workLogs = {};
		localStorage.removeItem("workLogs");
		renderCalendar();
		alert("✅ Всі дані видалені");
		toggleMenu();
	}
}

// Закриття по оверлею
document.getElementById("edit-modal").addEventListener("click", function (e) {
	if (e.target === this) closeModal();
});

// Закриття меню при кліку поза ним
document.addEventListener("click", function (e) {
	const menu = document.getElementById("export-menu");
	const menuBtn = document.querySelector(".menu-btn");
	if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
		menu.classList.remove("active");
	}
});

window.onload = renderCalendar;
