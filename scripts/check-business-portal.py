"""Repeatable business-portal Slice 1 and Slice 2 checks. Requires Playwright."""

import argparse
from contextlib import contextmanager
from datetime import date
import os
from pathlib import Path
import re
import signal
import socket
import subprocess
import tempfile
import time
from urllib.error import URLError
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright


@contextmanager
def preview_server():
    """Own only the preview process started here; never stop a user's server."""
    with socket.socket() as probe:
        if probe.connect_ex(("127.0.0.1", 3019)) == 0:
            raise RuntimeError("Port 3019 is occupied; stop that server or use --base-url")
    root = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryFile(mode="w+") as log:
        process = subprocess.Popen(
            ["npm", "run", "preview", "--", "--host", "127.0.0.1",
             "--port", "3019", "--strictPort"],
            cwd=root, stdout=log, stderr=subprocess.STDOUT, start_new_session=True,
        )
        try:
            deadline = time.monotonic() + 30
            while time.monotonic() < deadline:
                if process.poll() is not None:
                    break
                try:
                    with urlopen("http://127.0.0.1:3019/business/sign-in", timeout=2):
                        yield "http://127.0.0.1:3019"
                        return
                except (URLError, TimeoutError):
                    time.sleep(0.2)
            log.seek(0)
            raise RuntimeError("Preview did not start:\n" + log.read())
        finally:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait()


def run_checks(base_url, screenshots):
    base_url = base_url.rstrip("/")
    errors = []
    summaries = []
    navigation = {
        "Home": "dashboard", "Food handlers": "food-handlers",
        "Applications": "applications", "Certificates": "certificates",
        "Inspections": "inspections", "Business profile": "profile",
    }

    def visit(page, path):
        page.goto(base_url + path, wait_until="networkidle")

    def at(page, route):
        expect(page).to_have_url(base_url + "/business/" + route)
        page.wait_for_load_state("networkidle")

    def no_overflow(page):
        assert page.evaluate(
            "document.documentElement.scrollWidth <= window.innerWidth"
        ), "Horizontal overflow at " + page.url

    def passed(label):
        summaries.append(label)
        print("ok: " + label, flush=True)

    def sign_out(page):
        page.get_by_role("button", name="Business account", exact=True).click()
        page.get_by_role("menuitem", name="Sign out", exact=True).click()
        at(page, "sign-in")

    def dashboard(page):
        at(page, "dashboard")
        expect(page.get_by_role("heading", name="Business dashboard", exact=True)).to_be_visible()
        expect(page.get_by_text("Next required action", exact=True)).to_have_count(1)
        for title in ("Fitness", "Fumigation", "Health Approval"):
            expect(page.get_by_role("heading", name=title, exact=True)).to_be_visible()
        expect(page.get_by_role("link", name="Apply for Health Approval", exact=True)).to_have_count(0)
        no_overflow(page)

    def portal_destination(page, route):
        """Assert the real destination behind each portal navigation item."""
        at(page, route)
        if route == "dashboard":
            dashboard(page)
        elif route == "food-handlers":
            expect(page.get_by_role("heading", name="Food handlers", exact=True)).to_be_visible()
            expect(page.get_by_role("link", name="Add food handler", exact=True)).to_be_visible()
        elif route == "applications":
            expect(page.get_by_role("heading", name="Applications", exact=True)).to_be_visible()
            expect(page.get_by_role("heading", name="Fitness", exact=True)).to_be_visible()
            expect(page.get_by_role("link", name="Start Fitness application", exact=True)).to_be_visible()
        elif route == "certificates":
            expect(page.get_by_role("heading", name="Certificates", exact=True)).to_be_visible()
            expect(page.get_by_role("heading", name="Fitness Certificate", exact=True)).to_be_visible()
            expect(page.get_by_role("link", name="Start Fitness application", exact=True)).to_be_visible()
        elif route == "inspections":
            expect(page.get_by_role("heading", name="Inspections", exact=True)).to_be_visible()
            expect(page.get_by_role("link", name="View Health Approval requirements", exact=True)).to_be_visible()
        else:
            page.get_by_role("link", name="Return to dashboard", exact=True).click()
            dashboard(page)
        no_overflow(page)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            page = context.new_page()
            page.clock.install()
            page.on("pageerror", lambda error: errors.append("page: " + str(error)))
            page.on("console", lambda message: errors.append("console: " + message.text)
                    if message.type == "error" else None)

            visit(page, "/business/dashboard")
            at(page, "sign-in")
            visit(page, "/business/verify")
            at(page, "register")
            visit(page, "/business/setup")
            at(page, "register")
            passed("signed-out route guards")

            page.get_by_role("button", name="Create account", exact=True).click()
            expect(page.get_by_text("Enter the registered business name", exact=True)).to_be_visible()
            for label, value in {
                "Business name": "Browser Test Kitchen", "Contact person's name": "Demo Tester",
                "Phone number": "08039990001", "Email address": "browser-test@example.test",
                "Password": "browser-demo-password",
            }.items():
                page.get_by_label(label, exact=True).fill(value)
            page.get_by_role("checkbox").check()
            for label, reserved, replacement in (
                ("Email address", "ada@riverside.ng", "browser-test@example.test"),
                ("Phone number", "08031234567", "08039990001"),
            ):
                page.get_by_label(label, exact=True).fill(reserved)
                page.get_by_role("button", name="Create account", exact=True).click()
                expect(page.get_by_label(label, exact=True)).to_have_attribute("aria-invalid", "true")
                expect(page.get_by_text(re.compile("already registered")).first).to_be_visible()
                page.get_by_label(label, exact=True).fill(replacement)
            page.get_by_role("button", name="Create account", exact=True).click()
            at(page, "verify")
            expect(page.get_by_text("Use code 123456", exact=True)).to_be_visible()
            expect(page.get_by_text("b***@example.test or ••••••0001", exact=True)).to_be_visible()
            visit(page, "/business/register")
            page.get_by_role("button", name="Continue saved registration", exact=True).click()
            at(page, "verify")
            profile_before = page.evaluate("JSON.parse(localStorage.getItem('ehrcms:business:v1')).profile")
            page.get_by_role("button", name="Change contact", exact=True).click()
            expect(page.get_by_label("Email address", exact=True)).to_have_value("browser-test@example.test")
            for label, reserved, replacement in (
                ("Email address", "ada@riverside.ng", "updated@example.test"),
                ("Phone number", "08031234567", "08039990002"),
            ):
                page.get_by_label(label, exact=True).fill(reserved)
                page.get_by_role("button", name="Save contact and continue", exact=True).click()
                expect(page.get_by_label(label, exact=True)).to_have_attribute("aria-invalid", "true")
                expect(page.get_by_text(re.compile("already registered")).first).to_be_visible()
                page.get_by_label(label, exact=True).fill(replacement)
            page.get_by_role("button", name="Save contact and continue", exact=True).click()
            expect(page.get_by_text("u***@example.test or ••••••0002", exact=True)).to_be_visible()
            profile_after = page.evaluate("JSON.parse(localStorage.getItem('ehrcms:business:v1')).profile")
            assert profile_after == {**profile_before, "email": "updated@example.test", "phone": "08039990002"}
            passed("duplicate contact recovery and populated editing preserve the registration")
            visit(page, "/business/dashboard")
            at(page, "verify")
            visit(page, "/business/setup")
            at(page, "verify")
            page.get_by_label("6-digit verification code", exact=True).fill("654321")
            page.get_by_role("button", name="Verify and continue", exact=True).click()
            expect(page.get_by_text("Enter code 123456", exact=True).first).to_be_visible()
            at(page, "verify")
            page.clock.fast_forward(300_000)
            expect(page.get_by_text("This code has expired. Request a new code.", exact=True)).to_be_visible()
            expect(page.get_by_role("button", name="Verify and continue", exact=True)).to_be_disabled()
            page.get_by_role("button", name="Resend code", exact=True).click()
            expect(page.get_by_text("This code has expired. Request a new code.", exact=True)).to_have_count(0)
            passed("expired OTP recovery through resend")
            page.get_by_label("6-digit verification code", exact=True).fill("123456")
            page.get_by_role("button", name="Verify and continue", exact=True).click()
            at(page, "setup")
            visit(page, "/business/dashboard")
            at(page, "setup")
            passed("registration, wrong OTP recovery, verification and stage guards")

            page.get_by_role("button", name="Save and continue", exact=True).click()
            expect(page.get_by_text("Enter the premises address", exact=True)).to_be_visible()
            expect(page.get_by_text("Choose a council", exact=True).last).to_be_visible()
            page.get_by_label("Premises address", exact=True).fill("8 Demo Street")
            expect(page.get_by_text("Saved", exact=True)).to_be_visible()
            page.reload(wait_until="networkidle")
            expect(page.get_by_label("Premises address", exact=True)).to_have_value("8 Demo Street")
            page.get_by_label("Business type", exact=True).fill("Restaurant")
            page.get_by_label("Ward", exact=True).fill("Diobu")
            page.get_by_role("combobox", name="Council", exact=True).click()
            page.get_by_role("option", name="Port Harcourt City", exact=True).click()
            page.get_by_label(re.compile("Supporting document")).set_input_files({
                "name": "demo-permit.pdf", "mimeType": "application/pdf", "buffer": b"demo metadata only",
            })
            expect(page.get_by_text("demo-permit.pdf", exact=True)).to_be_visible()
            page.get_by_role("button", name="Save draft and exit", exact=True).click()
            at(page, "sign-in")
            page.get_by_role("button", name="Continue saved registration", exact=True).click()
            at(page, "setup")
            expect(page.get_by_label("Business type", exact=True)).to_have_value("Restaurant")
            expect(page.get_by_text("demo-permit.pdf", exact=True)).to_be_visible()
            page.get_by_role("button", name="Save and continue", exact=True).click()
            dashboard(page)
            saved = page.evaluate("JSON.parse(localStorage.getItem('ehrcms:business:v1'))")
            assert saved["stage"] == "complete"
            assert set(saved["profile"]["documents"][0]) == {"id", "name", "size", "category"}
            assert "password" not in saved["profile"] and "code" not in saved["profile"]
            visit(page, "/business/setup")
            dashboard(page)
            passed("setup validation, autosave reload, draft exit/resume, metadata and completion")
            sign_out(page)

            for contact in ("ada@riverside.ng", "08031234567"):
                page.get_by_label("Email or phone number", exact=True).fill(contact)
                page.get_by_label("Password", exact=True).fill("riverside-demo")
                page.get_by_role("button", name="Sign in", exact=True).click()
                dashboard(page)
                expect(page.get_by_text("Riverside Kitchen & Foods", exact=True).first).to_be_visible()
                sign_out(page)
            page.get_by_role("button", name="Preview as business user", exact=True).click()
            dashboard(page)
            passed("seeded email, phone and demo shortcut sign-in; sign out")

            visit(page, "/dashboard")
            page.get_by_label("Demo role", exact=True).select_option("business-user")
            dashboard(page)
            for label in ("Finance", "Users", "Council administration"):
                expect(page.get_by_role("link", name=label, exact=True)).to_have_count(0)
            for label, route in navigation.items():
                page.get_by_role("link", name=label, exact=True).click()
                portal_destination(page, route)
                if route in {"food-handlers", "applications", "certificates"}:
                    page.get_by_role("link", name="Home", exact=True).click()
                    dashboard(page)
            page.get_by_role("button", name="Notifications", exact=True).click()
            expect(page.get_by_text("No notifications yet", exact=True)).to_be_visible()
            page.keyboard.press("Escape")
            expect(page.get_by_role("menu")).to_be_hidden()
            page.get_by_role("button", name="Business account", exact=True).click()
            page.get_by_role("menuitem", name="Business profile", exact=True).click()
            at(page, "profile")
            page.get_by_role("link", name="Return to dashboard", exact=True).click()
            dashboard(page)
            passed("staff role handoff, desktop navigation, notifications and account menu")
            if screenshots:
                page.screenshot(path=str(screenshots / "business-dashboard-desktop.png"), full_page=True)

            page.set_viewport_size({"width": 390, "height": 844})
            no_overflow(page)
            for label, route in navigation.items():
                page.get_by_role("button", name="Open business navigation", exact=True).click()
                dialog = page.get_by_role("dialog")
                expect(dialog).to_be_visible()
                dialog.get_by_role("link", name=label, exact=True).click()
                expect(dialog).to_be_hidden()
                portal_destination(page, route)
            visit(page, "/business/dashboard")
            dashboard(page)
            if screenshots:
                page.screenshot(path=str(screenshots / "business-dashboard-mobile.png"), full_page=True)
            sign_out(page)
            no_overflow(page)
            visit(page, "/business/register")
            no_overflow(page)
            passed("390px mobile drawer, all destinations, sign out and no horizontal overflow")

            # Slice 2 is deliberately isolated from registration coverage above.
            # A fresh browser context proves the seeded demo journey has no hidden
            # dependency on the preceding localStorage state.
            fitness_context = browser.new_context(viewport={"width": 1440, "height": 1000})
            fitness_page = fitness_context.new_page()
            fitness_page.on("pageerror", lambda error: errors.append("page: " + str(error)))
            fitness_page.on("console", lambda message: errors.append("console: " + message.text)
                            if message.type == "error" else None)
            try:
                visit(fitness_page, "/business/sign-in")
                fitness_page.get_by_role("button", name="Preview as business user", exact=True).click()
                dashboard(fitness_page)

                fitness_page.get_by_role("link", name="Food handlers", exact=True).click()
                at(fitness_page, "food-handlers")
                fitness_page.get_by_role("link", name="Add food handler", exact=True).click()
                at(fitness_page, "food-handler/new")
                expect(fitness_page.get_by_role("dialog", name="Add food handler", exact=True)).to_be_visible()
                fitness_page.reload(wait_until="networkidle")
                expect(fitness_page.get_by_role("dialog", name="Add food handler", exact=True)).to_be_visible()
                fitness_page.set_viewport_size({"width": 390, "height": 844})
                no_overflow(fitness_page)
                fitness_page.set_viewport_size({"width": 1440, "height": 1000})
                for label, value in {
                    "Full name": "Amina Browser",
                    "Date of birth": "1994-07-16",
                    "Job role": "Cook",
                    "Identity number": "BROWSER-ID-001",
                    "Phone number": "08039990003",
                }.items():
                    fitness_page.get_by_label(label, exact=True).fill(value)
                fitness_page.get_by_label("Sex", exact=True).click()
                fitness_page.get_by_role("option", name="Female", exact=True).click()
                fitness_page.get_by_role(
                    "checkbox", name=re.compile("^I confirm this food handler")
                ).check()
                fitness_page.get_by_role("button", name="Save food handler", exact=True).click()
                at(fitness_page, "food-handlers")
                expect(fitness_page.get_by_text("Amina Browser", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text("Ready to apply", exact=True)).to_be_visible()

                # A saved name-only record stays visible but cannot be selected.
                fitness_page.get_by_role("link", name="Add food handler", exact=True).click()
                at(fitness_page, "food-handler/new")
                fitness_page.get_by_label("Full name", exact=True).fill("Incomplete Browser")
                fitness_page.get_by_role("button", name="Save food handler", exact=True).click()
                at(fitness_page, "food-handlers")
                fitness_page.get_by_role("link", name="Start Fitness application", exact=True).click()
                at(fitness_page, "fitness/apply")
                expect(fitness_page.get_by_role("dialog", name="Fitness application", exact=True)).to_be_visible()
                expect(fitness_page.get_by_role("checkbox", name="Incomplete Browser", exact=True)).to_be_disabled()
                expect(fitness_page.get_by_text("Role needed", exact=True)).to_be_visible()

                fitness_page.get_by_role("checkbox", name="Amina Browser", exact=True).check()
                expect(fitness_page.get_by_role("status")).to_have_text("1 selected")
                fitness_page.get_by_role("button", name="Continue to facility", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Choose an approved facility", exact=True)).to_be_visible()
                fitness_page.get_by_role(
                    "radio", name="Port Harcourt City Health Centre", exact=True
                ).check()
                fitness_page.get_by_role("button", name="Review application", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Review your application", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text("Amina Browser", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Proceed to payment", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Payment", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Confirm payment", exact=True).click()
                at(fitness_page, "fitness/tracker")
                expect(fitness_page.get_by_role("heading", name="Awaiting facility result", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Simulate facility Fit result", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Facility result received: Fit", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Simulate council issuance", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Council decision: issued", exact=True)).to_be_visible()
                fitness_page.get_by_role("link", name="View Fitness Certificate", exact=True).click()
                at(fitness_page, "fitness/certificate")
                expect(fitness_page.get_by_role("heading", name="Fitness Certificate", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text("Amina Browser", exact=True)).to_be_visible()
                fitness_page.reload(wait_until="networkidle")
                expect(fitness_page.get_by_role("heading", name="Fitness Certificate", exact=True)).to_be_visible()
                fitness_page.get_by_role("link", name="Home", exact=True).click()
                dashboard(fitness_page)
                expect(fitness_page.get_by_text("Issued", exact=True)).to_be_visible()

                fitness_page.get_by_role("link", name="Start Fumigation application", exact=True).first.click()
                at(fitness_page, "fumigation/apply")
                expect(fitness_page.get_by_role("dialog", name="Fumigation application", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Choose provider", exact=True).click()
                expect(fitness_page.get_by_role("alert")).to_contain_text("Enter the requested fumigation period")
                fitness_page.get_by_label("Requested service month", exact=True).fill(date.today().strftime("%Y-%m"))
                fitness_page.get_by_role("button", name="Choose provider", exact=True).click()
                expect(fitness_page.get_by_role("alert")).to_contain_text("Confirm the premises declaration")
                fitness_page.get_by_role("checkbox", name=re.compile("I confirm these premises details")).check()
                fitness_page.get_by_role("button", name="Choose provider", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Choose a licensed provider", exact=True)).to_be_visible()
                fitness_page.get_by_role("radio", name=re.compile("Clearfield Environmental Services")).check()
                fitness_page.get_by_role("button", name="Select provider", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Review your application", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text("₦45,000").first).to_be_visible()
                fitness_page.get_by_role("button", name="Proceed to payment", exact=True).click()
                expect(fitness_page.get_by_text(re.compile("No money moves"))).to_be_visible()
                fitness_page.get_by_role("button", name="Confirm payment", exact=True).click()
                at(fitness_page, "fumigation/tracker")
                expect(fitness_page.get_by_role("heading", name="Awaiting provider report", exact=True)).to_be_visible()
                expect(fitness_page.get_by_role("button", name="Simulate council decision", exact=True)).to_be_disabled()
                fitness_page.get_by_role("button", name="Simulate provider report", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Report submitted", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Simulate EHO confirmation", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Awaiting council decision", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Simulate council decision", exact=True).click()
                fitness_page.get_by_role("link", name="View Fumigation Certificate", exact=True).click()
                at(fitness_page, "fumigation/certificate")
                expect(fitness_page.get_by_role("heading", name="Fumigation Certificate", exact=True).first).to_be_visible()
                expect(fitness_page.get_by_text("Clearfield Environmental Services", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text(re.compile("not an official council document"))).to_be_visible()
                fitness_page.reload(wait_until="networkidle")
                expect(fitness_page.get_by_role("heading", name="Fumigation Certificate", exact=True).first).to_be_visible()
                passed("Slice 3 Fumigation validation, provider, payment, external decisions, certificate, and persistence")

                fitness_page.get_by_role("link", name="Home", exact=True).click()
                dashboard(fitness_page)
                next_action = fitness_page.get_by_role("region", name="Next required action")
                next_action.get_by_role("link", name="View Health Approval", exact=True).click()
                at(fitness_page, "health-approval")
                expect(fitness_page.get_by_role("heading", name="Health Approval", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text("Requirements met", exact=True)).to_be_visible()
                expect(fitness_page.get_by_role("link", name="Apply for Health Approval", exact=True)).to_have_count(0)
                fitness_page.get_by_role("button", name="Simulate inspection notice", exact=True).click()
                fitness_page.get_by_role("link", name="View inspection notice", exact=True).click()
                at(fitness_page, "inspections")
                expect(fitness_page.get_by_role("heading", name="Inspection notice", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Acknowledge notice", exact=True).click()
                fitness_page.get_by_role("button", name="Simulate inspection findings", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Corrective actions", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Record correction", exact=True).first.click()
                expect(fitness_page.get_by_role("dialog", name="Record correction", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Save correction", exact=True).click()
                expect(fitness_page.get_by_text("Enter a correction note before saving.", exact=True)).to_be_visible()
                fitness_page.get_by_label("How was this corrected?", exact=True).fill("Dry goods moved into sealed containers and raised storage")
                fitness_page.get_by_role("button", name="Save correction", exact=True).click()
                fitness_page.get_by_role("button", name="Record correction", exact=True).first.click()
                fitness_page.get_by_label("How was this corrected?", exact=True).fill("Covered bins installed and daily disposal log started")
                fitness_page.get_by_role("button", name="Save correction", exact=True).click()
                fitness_page.get_by_role("button", name="Simulate follow-up notice", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Follow-up inspection notice", exact=True)).to_be_visible()
                fitness_page.get_by_role("button", name="Acknowledge follow-up notice", exact=True).click()
                fitness_page.get_by_role("button", name="Simulate findings resolved", exact=True).click()
                fitness_page.get_by_role("link", name="View Health Approval decision", exact=True).click()
                at(fitness_page, "health-approval")
                fitness_page.get_by_role("button", name="Simulate council issuance", exact=True).click()
                expect(fitness_page.get_by_role("heading", name="Health Approval Certificate", exact=True)).to_be_visible()
                expect(fitness_page.get_by_text(re.compile("not an official council document"))).to_be_visible()
                fitness_page.reload(wait_until="networkidle")
                expect(fitness_page.get_by_role("heading", name="Health Approval Certificate", exact=True)).to_be_visible()
                passed("Slice 4 eligibility, notices, corrective actions, follow-up, council outcome, and persistence")

                fitness_page.set_viewport_size({"width": 390, "height": 844})
                for route in (
                    "dashboard",
                    "food-handlers",
                    "applications",
                    "certificates",
                    "fitness/tracker",
                    "fitness/certificate",
                    "fumigation/apply",
                    "fumigation/tracker",
                    "fumigation/certificate",
                    "health-approval",
                    "inspections",
                ):
                    visit(fitness_page, "/business/" + route)
                    no_overflow(fitness_page)
                passed("fresh seeded Slice 2 Fitness journey, issued-state persistence and 390px layout")
            finally:
                fitness_context.close()
            assert not errors, "Browser errors:\n" + "\n".join(errors)
            passed("no browser console or page errors")
            print(f"PASS: {len(summaries)} journey groups", flush=True)
        finally:
            browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--base-url", default="http://localhost:3000")
    group.add_argument("--start-server", action="store_true", help="Own a production preview on port 3019 (build first)")
    parser.add_argument("--screenshots", type=Path)
    args = parser.parse_args()
    if args.screenshots:
        args.screenshots.mkdir(parents=True, exist_ok=True)
    if args.start_server:
        with preview_server() as url:
            run_checks(url, args.screenshots)
    else:
        run_checks(args.base_url, args.screenshots)
