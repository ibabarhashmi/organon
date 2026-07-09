// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vault {
    address public admin;
    uint256 public totalDeposits;

    // an intentionally UNPROTECTED state-changing admin function (auth-surface should FLAG)
    function setAdmin(address a) external {
        admin = a;
    }

    function deposit() external payable {
        totalDeposits += msg.value;
    }

    // an eth-transfer / external control handoff (call-graph / value-flow surface)
    function withdraw(uint256 amt) external {
        totalDeposits -= amt;
        (bool ok, ) = msg.sender.call{value: amt}("");
        require(ok, "xfer failed");
    }
}
