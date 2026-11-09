// Shared enquiry composer for the redesign variants.
// Builds an email to contact@williwolff.com from the form; no backend.
(function () {
  var form = document.getElementById('enquiry');
  if (!form) return;
  var out = document.getElementById('composed');
  var to = 'contact@williwolff.com';
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function kind() {
    var sel = document.getElementById('enq-kind');
    if (sel) return sel.value;
    var c = form.querySelector('input[name="kind"]:checked');
    return c ? c.value : 'A project';
  }
  // Preselect a kind from links like #enquire-footage
  document.querySelectorAll('[data-kind]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form.querySelector('input[name="kind"][value="' + a.dataset.kind + '"]');
      if (r) r.checked = true;
      var sel = document.getElementById('enq-kind');
      if (sel) sel.value = a.dataset.kind;
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var subject = kind() + (val('enq-name') ? ' · ' + val('enq-name') : '');
    var body = [
      'Hi Will,', '',
      val('enq-msg') || '(a few lines about the project)', '',
      'Kind: ' + kind(),
      val('enq-when') ? 'Timing: ' + val('enq-when') : '',
      '', val('enq-name'), val('enq-email')
    ].filter(function (l, i, a) { return !(l === '' && a[i - 1] === ''); }).join('\n');
    var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (out) {
      out.hidden = false;
      out.querySelector('.composed-subject').textContent = subject;
      out.querySelector('.composed-body').textContent = body;
      out.querySelector('.composed-open').setAttribute('href', href);
      var copy = out.querySelector('.composed-copy');
      copy.onclick = function () {
        var text = 'To: ' + to + '\nSubject: ' + subject + '\n\n' + body;
        var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy text'; }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      };
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    window.location.href = href;
  });
})();
