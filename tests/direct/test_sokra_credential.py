"""Direct-mode tests for Sokra's consensus-backed credential registry."""


CONTRACT = "contracts/sokra_credential.py"
PROMPT = r"(?s).*independent GenLayer validator.*"


def _mint(registry, holder, credential_id="credential-001"):
    return registry.mint_credential(
        credential_id,
        holder,
        "Proofs",
        "Proof Builder",
        "cryptography",
        "The learner explains why a proof can be checked without revealing the witness.",
        "They connect completeness, soundness, and zero knowledge in their own words.",
        "Learner: A proof lets a verifier check a claim without seeing the secret.\n"
        "Coach: What makes that check trustworthy?\n"
        "Learner: Soundness limits false proofs, while zero knowledge hides the witness.",
    )


def test_mint_scores_and_stores_credential(direct_vm, direct_deploy, direct_owner):
    direct_vm.sender = direct_owner
    registry = direct_deploy(CONTRACT)
    direct_vm.mock_llm(PROMPT, "88")

    _mint(registry, registry.get_owner())

    credential = registry.get_credential("credential-001")
    assert credential.token_id == "SKR-CREDENTIAL"
    assert credential.holder == registry.get_owner()
    assert credential.quality_score == 88
    assert credential.quality_descriptor == "clear reasoning"
    assert credential.status == "minted"
    assert registry.get_credential_count() == 1
    assert registry.is_minted("credential-001") is True


def test_score_below_threshold_does_not_mint(direct_vm, direct_deploy, direct_owner):
    direct_vm.sender = direct_owner
    registry = direct_deploy(CONTRACT)
    direct_vm.mock_llm(PROMPT, "55")

    with direct_vm.expect_revert("below the credential threshold"):
        _mint(registry, registry.get_owner(), "credential-low")

    assert registry.get_credential_count() == 0
    assert registry.is_minted("credential-low") is False


def test_duplicate_credential_is_rejected(direct_vm, direct_deploy, direct_owner):
    direct_vm.sender = direct_owner
    registry = direct_deploy(CONTRACT)
    direct_vm.mock_llm(PROMPT, "92")

    _mint(registry, registry.get_owner(), "credential-duplicate")
    with direct_vm.expect_revert("Credential already minted"):
        _mint(registry, registry.get_owner(), "credential-duplicate")

    assert registry.get_credential_count() == 1


def test_only_operator_can_mint(direct_vm, direct_deploy, direct_owner, direct_alice):
    direct_vm.sender = direct_owner
    registry = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("Only the Sokra operator"):
        _mint(registry, registry.get_owner(), "credential-unauthorized")

    assert registry.get_credential_count() == 0
